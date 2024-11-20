'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Clock, Hash, Database, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BetMarket() {
  const [account, setAccount] = useState<string | null>(null)
  const [blockInfo, setBlockInfo] = useState({
    currentHeight: 0,
    currentHash: '',
    nextHeight: 0,
    nextTime: '',
    fees: {
      low: '12',
      medium: '24',
      high: '48'
    }
  })

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setAccount(accounts[0])
      } catch (error) {
        console.error('Error connecting to MetaMask', error)
      }
    } else {
      console.log('Please install MetaMask!')
    }
  }

  const placeBet = async (tag: number) => {
    if (!account) {
      alert('Please connect your wallet first')
      return
    }

    const amount = prompt('Please enter the bet amount (USDT):')
    if (!amount || isNaN(Number(amount))) {
      alert('Please enter a valid amount')
      return
    }

    // Here you would typically interact with the smart contract
    console.log(`Placing bet: Tag ${tag}, Amount ${amount} USDT`)
    alert(`Bet placed: Tag ${tag}, Amount ${amount} USDT`)
  }

  const fetchBlockData = async () => {
    // In a real application, you would fetch this data from a blockchain API
    const mockData = {
      currentHeight: Math.floor(Math.random() * 1000000),
      currentHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      nextHeight: 0,
      nextTime: '',
      fees: {
        low: '12',
        medium: '24',
        high: '48'
      }
    }
    mockData.nextHeight = mockData.currentHeight + 1
    mockData.nextTime = new Date(Date.now() + 10 * 60 * 1000).toLocaleString()
    setBlockInfo(mockData)
  }

  useEffect(() => {
    fetchBlockData()
    const interval = setInterval(fetchBlockData, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#1a1b1f] text-gray-100">
      <div className="container mx-auto p-4">
        <Card className="mb-8 bg-[#212128] border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-200 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Blockchain Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#17171f] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Current Block</span>
                  </div>
                  <span className="font-mono text-blue-400">{blockInfo.currentHeight}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#17171f] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Block Hash</span>
                  </div>
                  <span className="font-mono text-blue-400 text-xs truncate max-w-[150px]" title={blockInfo.currentHash}>
                    {blockInfo.currentHash}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#17171f] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Next Block ETA</span>
                  </div>
                  <span className="font-mono text-blue-400">{blockInfo.nextTime}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Tabs defaultValue="low" className="w-full">
                  <TabsList className="w-full bg-[#17171f]">
                    <TabsTrigger value="low" className="flex-1">Low Priority</TabsTrigger>
                    <TabsTrigger value="medium" className="flex-1">Medium Priority</TabsTrigger>
                    <TabsTrigger value="high" className="flex-1">High Priority</TabsTrigger>
                  </TabsList>
                  <TabsContent value="low" className="p-3 bg-[#17171f] rounded-lg mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Fee Rate</span>
                      <span className="font-mono text-blue-400">{blockInfo.fees.low} sat/vB</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="medium" className="p-3 bg-[#17171f] rounded-lg mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Fee Rate</span>
                      <span className="font-mono text-blue-400">{blockInfo.fees.medium} sat/vB</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="high" className="p-3 bg-[#17171f] rounded-lg mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Fee Rate</span>
                      <span className="font-mono text-blue-400">{blockInfo.fees.high} sat/vB</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          {account ? (
            <p className="flex items-center text-gray-200">
              <Wallet className="mr-2" />
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          ) : (
            <Button onClick={connectWallet} variant="outline" className="text-gray-200 border-gray-700">
              Connect Wallet
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(16)].map((_, index) => (
            <Card key={index} className="bg-[#212128] border-gray-800">
              <CardContent className="p-4">
                <p className="mb-2 text-gray-300">Tag {index}</p>
                <Button 
                  onClick={() => placeBet(index)} 
                  disabled={!account}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Place Bet
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!account && (
          <div className="mt-4 flex items-center text-yellow-600">
            <AlertCircle className="mr-2" />
            <p>Please connect your wallet to place bets.</p>
          </div>
        )}
      </div>
    </div>
  )
}