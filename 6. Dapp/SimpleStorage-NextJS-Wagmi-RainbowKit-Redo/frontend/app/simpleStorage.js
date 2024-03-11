'use client'

import React, { useState, useEffect } from 'react';

import { simpleStorageAbi, simpleStorageAddress } from '@/constants';

import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'

import { parseAbiItem } from 'viem'

import { publicClient } from '../utils/client'

export function SimpleStorage() {

  const { address } = useAccount();
  const [number, setNumber] = useState(null);
  const [events, setEvents] = useState([]);
  const toast = useToast();

  return (
    <div>Simple storage</div>
  )
}