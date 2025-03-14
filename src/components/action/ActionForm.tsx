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
import { Label } from '@/components/ui/label';
import { useWalletStore } from '@/stores/walletStore';
import { useActions } from '@/hooks/useActions';
import { Textarea } from '@/components/ui/textarea';
import { ActionConfirmModal } from './ActionConfirmModal';
import WalletConnect from '../wallet/WalletConnect';

type ActionType = 'transfer' | 'data-submit';

export function ActionForm() {
  // State for form inputs
  const [actionType, setActionType] = useState<ActionType>('transfer');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [dataToSubmit, setDataToSubmit] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    recipient?: string;
    amount?: string;
    data?: string;
  }>({});

  // Wallet and actions hook
  const { account } = useWalletStore();
  const { performTransfer, submitData, isProcessing, error } = useActions();

  // Validate form
  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (actionType === 'transfer') {
      // Validate recipient
      if (!recipient) {
        errors.recipient = 'Recipient address is required';
      }

      // Validate amount
      if (!amount) {
        errors.amount = 'Amount is required';
      } else {
        const amountNum = parseFloat(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
          errors.amount = 'Amount must be a positive number';
        }
      }
    } else {
      // Validate data submission
      if (!dataToSubmit) {
        errors.data = 'Data is required';
      } else if (dataToSubmit.length > 1024) {
        errors.data = 'Data must be less than 1024 characters';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    // Open confirmation modal
    setIsConfirmModalOpen(true);
  };

  // Confirm transaction
  const confirmAction = async () => {
    try {
      if (actionType === 'transfer') {
        await performTransfer(recipient, amount);
      } else {
        await submitData(dataToSubmit);
      }

      // Reset form
      setRecipient('');
      setAmount('');
      setDataToSubmit('');
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error('Action error', err);
    }
  };

  // Render form inputs based on action type
  const renderTypeSpecificInputs = () => {
    if (actionType === 'transfer') {
      return (
        <>
          <div className='grid w-full max-w-sm items-center gap-1.5'>
            <Label htmlFor='recipient'>Recipient Address</Label>
            <Input
              type='text'
              id='recipient'
              placeholder='Enter recipient address'
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={formErrors.recipient ? 'border-red-500' : ''}
            />
            {formErrors.recipient && (
              <p className='text-red-500 text-sm'>{formErrors.recipient}</p>
            )}
          </div>
          <div className='grid w-full max-w-sm items-center gap-1.5'>
            <Label htmlFor='amount'>Amount (AVAIL)</Label>
            <Input
              type='number'
              id='amount'
              placeholder='Enter amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step='0.000001'
              min='0'
              className={formErrors.amount ? 'border-red-500' : ''}
            />
            {formErrors.amount && (
              <p className='text-red-500 text-sm'>{formErrors.amount}</p>
            )}
          </div>
        </>
      );
    }

    return (
      <div className='grid w-full max-w-sm items-center gap-1.5'>
        <Label htmlFor='data'>Data to Submit</Label>
        <Textarea
          id='data'
          placeholder='Enter data to submit'
          value={dataToSubmit}
          onChange={(e) => setDataToSubmit(e.target.value)}
          className={formErrors.data ? 'border-red-500' : ''}
        />
        {formErrors.data && (
          <p className='text-red-500 text-sm'>{formErrors.data}</p>
        )}
      </div>
    );
  };

  return (
    <div className='w-full max-w-md mx-auto space-y-4'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid w-full max-w-sm items-center gap-1.5'>
          <Label>Action Type</Label>
          <Select
            value={actionType}
            onValueChange={(value: ActionType) => setActionType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select action type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='transfer'>Transfer</SelectItem>
              <SelectItem value='data-submit'>Data Submission</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderTypeSpecificInputs()}

        {account ? (
          <Button type='submit' className='w-full' disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Submit'}
          </Button>
        ) : (
          <WalletConnect />
        )}

        {error && (
          <div className='text-red-500 text-sm text-center'>{error}</div>
        )}
      </form>

      <ActionConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        actionType={actionType}
        details={{
          recipient,
          amount,
          data: dataToSubmit,
        }}
      />
    </div>
  );
}
