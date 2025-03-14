'use client';

import React, { useState } from 'react';
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

  // Wallet and actions hook
  const { account } = useWalletStore();
  const { transferAvail, submitData, isProcessing, error } = useActionsStore();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [id]: true,
    }));

    // Clear error when typing
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;

    setTouched((prev) => ({
      ...prev,
      [id]: true,
    }));

    // Validate single field
    validateField(id as keyof FormValues);
  };

  // Validate a single field
  const validateField = (field: keyof FormValues) => {
    const newErrors: FormErrors = { ...errors };

    switch (field) {
      case 'recipient':
        if (actionType === 'transfer') {
          if (!values.recipient) {
            newErrors.recipient = 'Recipient address is required';
          } else if (!values.recipient.startsWith('5')) {
            newErrors.recipient = 'Invalid address format';
          } else {
            delete newErrors.recipient;
          }
        }
        break;

      case 'amount':
        if (actionType === 'transfer') {
          if (!values.amount) {
            newErrors.amount = 'Amount is required';
          } else {
            const amountNum = parseFloat(values.amount);
            if (isNaN(amountNum) || amountNum <= 0) {
              newErrors.amount = 'Amount must be a positive number';
            } else {
              delete newErrors.amount;
            }
          }
        }
        break;

      case 'data':
        if (actionType === 'data-submit') {
          if (!values.data) {
            newErrors.data = 'Data is required';
          } else if (values.data.length > 1024) {
            newErrors.data = 'Data must be less than 1024 characters';
          } else {
            delete newErrors.data;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all form fields
  const validateForm = () => {
    const fieldsToValidate =
      actionType === 'transfer' ? ['recipient', 'amount'] : ['data'];

    // Mark all relevant fields as touched
    const newTouched = { ...touched };
    fieldsToValidate.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate each field
    const newErrors: FormErrors = {};

    if (actionType === 'transfer') {
      if (!values.recipient) {
        newErrors.recipient = 'Recipient address is required';
      } else if (!values.recipient.startsWith('5')) {
        newErrors.recipient = 'Invalid address format';
      }

      if (!values.amount) {
        newErrors.amount = 'Amount is required';
      } else {
        const amountNum = parseFloat(values.amount);
        if (isNaN(amountNum) || amountNum <= 0) {
          newErrors.amount = 'Amount must be a positive number';
        }
      }
    } else {
      if (!values.data) {
        newErrors.data = 'Data is required';
      } else if (values.data.length > 1024) {
        newErrors.data = 'Data must be less than 1024 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    // Open confirmation modal
    setIsConfirmModalOpen(true);
  };

  // Handle action type change
  const handleActionTypeChange = (value: ActionType) => {
    setActionType(value);
    setErrors({});
    setTouched({});
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

  // Render form inputs based on action type
  const renderTypeSpecificInputs = () => {
    if (actionType === 'transfer') {
      return (
        <>
          <div className='flex-1 mr-2 relative'>
            <Input
              type='text'
              id='recipient'
              placeholder='Enter recipient address'
              value={values.recipient}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 ${
                touched.recipient && errors.recipient ? 'border-red-500' : ''
              }`}
            />
            {touched.recipient && errors.recipient && (
              <p className='text-red-500 text-xs absolute left-0 top-full mt-1'>
                {errors.recipient}
              </p>
            )}
          </div>
          <div className='w-32 mr-2 relative'>
            <Input
              type='number'
              id='amount'
              placeholder='Amount'
              value={values.amount}
              onChange={handleChange}
              onBlur={handleBlur}
              step='0.000001'
              min='0'
              className={`bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                touched.amount && errors.amount ? 'border-red-500' : ''
              }`}
            />
            {touched.amount && errors.amount && (
              <p className='text-red-500 text-xs absolute left-0 top-full mt-1'>
                {errors.amount}
              </p>
            )}
          </div>
        </>
      );
    }

    return (
      <div className='flex-1 mr-2 relative'>
        <Input
          id='data'
          placeholder='Enter data to submit'
          value={values.data}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 ${
            touched.data && errors.data ? 'border-red-500' : ''
          }`}
        />
        {touched.data && errors.data && (
          <p className='text-red-500 text-xs absolute left-0 top-full mt-1'>
            {errors.data}
          </p>
        )}
      </div>
    );
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
            className='bg-secondary text-white hover:bg-muted border-white/20 border rounded-md font-normal transition-all duration-200 h-12 px-6 text-base cursor-pointer'
            disabled={isProcessing}
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
            <span>
              {(() => {
                try {
                  // Try to parse if the error is a JSON string
                  const errorObj = JSON.parse(error);
                  const messages = Object.entries(errorObj)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('; ');
                  return messages;
                } catch {
                  return error;
                }
              })()}
            </span>
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
