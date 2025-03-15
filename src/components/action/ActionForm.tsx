'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/stores/walletStore';
import { ActionConfirmModal } from './ActionConfirmModal';
import WalletConnect from '../wallet/WalletConnect';
import { AlertCircle } from 'lucide-react';
import { useActionsStore } from '@/stores/actionStore';
import { WalletBalance } from '@/types/wallet';
import { isValidSubstrateAddress } from '@/lib/validators/transferValidation';

type ActionType = 'transfer' | 'data-submit';

interface FormValues {
  recipient: string;
  amount: string;
  data: string;
}

interface FormErrors {
  recipient?: string;
  amount?: string;
  data?: string;
}

// Field validator functions for cleaner code
const validators = {
  recipient: (value: string): string | undefined => {
    if (!value) return 'Recipient address is required';
    if (!isValidSubstrateAddress(value)) return 'Invalid address';
  },

  amount: (
    value: string,
    balance: WalletBalance | null
  ): string | undefined => {
    if (!value) return 'Amount is required';

    const amountNum = parseFloat(value);
    if (isNaN(amountNum) || amountNum <= 0)
      return 'Amount must be a positive number';

    if (balance?.free) {
      try {
        // First convert to a string with the decimal point
        const amountStr = amountNum.toString();

        // Handle the decimal places correctly
        const [whole, decimalPart] = amountStr.includes('.')
          ? amountStr.split('.')
          : [amountStr, ''];

        // Pad the decimal part to 18 places or truncate if longer
        const decimal = decimalPart.padEnd(18, '0').slice(0, 18);

        // Create the string representation without decimal point
        const amountInSmallestUnit = whole + decimal;

        if (BigInt(amountInSmallestUnit) > BigInt(balance.free)) {
          return 'Insufficient balance';
        }
      } catch (e) {
        console.error('Error comparing balance:', e);
        return 'Error validating amount';
      }
    }

    return undefined;
  },

  data: (value: string): string | undefined => {
    if (!value) return 'Data is required';
    if (value.length > 1024) return 'Data must be less than 1024 characters';
    return undefined;
  },
};

export function ActionForm() {
  // State for form inputs
  const [actionType, setActionType] = useState<ActionType>('transfer');
  const [values, setValues] = useState<FormValues>({
    recipient: '',
    amount: '',
    data: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Wallet and actions hook
  const { account, balance } = useWalletStore();
  const { transferAvail, submitData, isProcessing, error } = useActionsStore();

  // Get active fields based on action type
  const getActiveFields = (): (keyof FormValues)[] => {
    return actionType === 'transfer' ? ['recipient', 'amount'] : ['data'];
  };

  // Validate form and update form validity state
  const validateForm = (formValues = values, formTouched = touched) => {
    const fieldsToValidate = getActiveFields();
    const newErrors: FormErrors = {};
    let valid = true;

    // Only validate fields that have been touched
    fieldsToValidate.forEach((field) => {
      // Skip validation for untouched fields
      if (!formTouched[field]) return;

      // Validate each field and collect errors
      let errorMessage;
      switch (field) {
        case 'recipient':
          errorMessage = validators.recipient(formValues.recipient);
          break;
        case 'amount':
          errorMessage = validators.amount(formValues.amount, balance);
          break;
        case 'data':
          errorMessage = validators.data(formValues.data);
          break;
      }

      if (errorMessage) {
        newErrors[field] = errorMessage;
        valid = false;
      }
    });

    setErrors(newErrors);
    setIsFormValid(
      valid &&
        Object.keys(formTouched).length > 0 &&
        fieldsToValidate.every((field) => formTouched[field])
    );
    return newErrors;
  };

  // Update form validity whenever fields or touched state changes
  useEffect(() => {
    validateForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, touched, actionType, balance]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Mark field as touched if it wasn't already
    if (!touched[id]) {
      setTouched((prev) => ({
        ...prev,
        [id]: true,
      }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = getActiveFields().reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setTouched(allTouched);

    // Validate form with all fields marked as touched
    const newErrors = validateForm(values, allTouched);

    // Open confirmation modal if no errors
    if (Object.keys(newErrors).length === 0) {
      setIsConfirmModalOpen(true);
    }
  };

  // Handle action type change
  const handleActionTypeChange = (value: ActionType) => {
    setActionType(value);
    setErrors({});
    setTouched({});
    setIsFormValid(false);
  };

  // Confirm transaction
  const confirmAction = async () => {
    try {
      if (actionType === 'transfer') {
        return await transferAvail(values.recipient, values.amount);
      } else {
        return await submitData(values.data);
      }
    } catch (err) {
      console.error('Action error', err);
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : 'Transaction failed',
      };
    }
  };

  // Close modal
  const handleModalClose = () => {
    setIsConfirmModalOpen(false);
  };

  // Render input field with error handling
  const renderField = (
    id: keyof FormValues,
    type: string,
    placeholder: string,
    className: string = '',
    extraProps = {}
  ) => {
    return (
      <div className={`relative ${className}`}>
        <Input
          type={type}
          id={id}
          placeholder={placeholder}
          value={values[id]}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 ${
            touched[id] && errors[id] ? 'border-red-500' : ''
          }`}
          {...extraProps}
        />
        {touched[id] && errors[id] && (
          <p className='text-red-500 text-xs absolute left-0 top-full mt-1'>
            {errors[id]}
          </p>
        )}
      </div>
    );
  };

  // Render form inputs based on action type
  const renderTypeSpecificInputs = () => {
    if (actionType === 'transfer') {
      return (
        <>
          {renderField(
            'recipient',
            'text',
            'Enter recipient address',
            'flex-1 mr-2'
          )}
          {renderField('amount', 'number', 'Amount', 'w-32 mr-2', {
            step: '0.000001',
            min: '0',
            className: `bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              touched.amount && errors.amount ? 'border-red-500' : ''
            }`,
          })}
        </>
      );
    }

    return renderField('data', 'text', 'Enter data to submit', 'flex-1 mr-2');
  };

  // Format error message
  const formatErrorMessage = (errorStr: string) => {
    try {
      // Try to parse if the error is a JSON string
      const errorObj = JSON.parse(errorStr);
      return Object.entries(errorObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
    } catch {
      return errorStr;
    }
  };

  return (
    <div className='w-full mx-auto max-w-5xl'>
      <form onSubmit={handleSubmit} className='flex items-center flex-wrap'>
        <div className='mr-2'>
          <Select value={actionType} onValueChange={handleActionTypeChange}>
            <SelectTrigger className='bg-secondary border-white/20 text-white hover:bg-muted focus:ring-white focus:ring-offset-0 transition-all duration-200 px-4 py-6 w-48'>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>
            <SelectContent className='bg-black border border-gray-800 text-white'>
              <SelectItem
                value='transfer'
                className='focus:bg-muted focus:text-white'
              >
                Transfer
              </SelectItem>
              <SelectItem
                value='data-submit'
                className='focus:bg-muted focus:text-white'
              >
                Data Submission
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderTypeSpecificInputs()}

        {account ? (
          <Button
            type='submit'
            className='bg-secondary text-white hover:bg-muted border-white/20 border rounded-md font-normal transition-all duration-200 h-12 px-6 text-base cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
            disabled={isProcessing || !isFormValid}
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </Button>
        ) : (
          <div>
            <WalletConnect />
          </div>
        )}

        {error && (
          <div className='w-full mt-2 flex items-center text-red-500 text-sm'>
            <AlertCircle className='h-4 w-4 mr-1' />
            <span>{formatErrorMessage(error)}</span>
          </div>
        )}
      </form>

      <ActionConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleModalClose}
        onConfirm={confirmAction}
        actionType={actionType}
        details={{
          recipient: values.recipient,
          amount: values.amount,
          data: values.data,
        }}
      />
    </div>
  );
}
