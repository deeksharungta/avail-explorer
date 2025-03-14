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
import { useActions } from '@/hooks/useActions';
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
          <div className='flex-1 mr-2'>
            <Input
              type='text'
              id='recipient'
              placeholder='Enter recipient address'
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 ${
                formErrors.recipient ? 'border-red-500' : ''
              }`}
            />
            {formErrors.recipient && (
              <p className='text-red-500 text-xs mt-1'>
                {formErrors.recipient}
              </p>
            )}
          </div>
          <div className='w-32 mr-2'>
            <Input
              type='number'
              id='amount'
              placeholder='Amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step='0.000001'
              min='0'
              className={`bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                formErrors.amount ? 'border-red-500' : ''
              }`}
            />
            {formErrors.amount && (
              <p className='text-red-500 text-xs mt-1'>{formErrors.amount}</p>
            )}
          </div>
        </>
      );
    }

    return (
      <div className='flex-1 mr-2'>
        <Input
          id='data'
          placeholder='Enter data to submit'
          value={dataToSubmit}
          onChange={(e) => setDataToSubmit(e.target.value)}
          className={`bg-secondary border-white/20 focus:border-white/20 text-white h-12 px-4 ${
            formErrors.data ? 'border-red-500' : ''
          }`}
        />
        {formErrors.data && (
          <p className='text-red-500 text-xs mt-1'>{formErrors.data}</p>
        )}
      </div>
    );
  };

  return (
    <div className='w-full mx-auto max-w-5xl'>
      <form onSubmit={handleSubmit} className='flex items-center'>
        <div className='mr-2 '>
          <Select
            value={actionType}
            onValueChange={(value: ActionType) => setActionType(value)}
          >
            <SelectTrigger className='bg-secondary border-white/20 text-white hover:bg-muted focus:ring-white focus:ring-offset-0 transition-all duration-200 px-4 py-5'>
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
            className='bg-secondary text-white hover:bg-muted border-white/20 border rounded-md font-normal transition-all duration-200 h-12 px-6 text-base'
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </Button>
        ) : (
          <div>
            <WalletConnect />
          </div>
        )}

        {error && <div className='text-red-500 text-xs ml-2'>{error}</div>}
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
