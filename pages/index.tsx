import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Button,
  useToast,
  VStack,
  HStack,
  Tag,
  useColorModeValue,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Divider,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import BetMarketABI from '../contracts/BetMarket.json';
import BlockchainInfo from '../components/BlockchainInfo';

interface BlockInfo {
  height: number;
  hash: string;
  timestamp?: number;
  size?: number;
  weight?: number;
  health?: number;
  feeRange?: [number, number];
  medianFee?: number;
  totalFee?: number;
  reward?: number;
  miner?: string;
}

const MotionBox = motion(Box);

// 自定义颜色主题
const theme = {
  bg: {
    primary: '#0F172A',    // 深蓝黑色背景
    secondary: '#1E293B',  // 稍浅的蓝黑色
    accent: '#334155',     // 高亮背景
  },
  text: {
    primary: '#E2E8F0',    // 主要文字颜色
    secondary: '#94A3B8',  // 次要文字颜色
    accent: '#38BDF8',     // 强调文字颜色
  },
  gradient: {
    primary: 'linear(to-r, #38BDF8, #818CF8)',  // 主要渐变
    secondary: 'linear(to-r, #0EA5E9, #6366F1)', // 次要渐变
  },
  border: {
    primary: '#334155',    // 主要边框颜色
    highlight: '#38BDF8',  // 高亮边框颜色
  },
};

export default function Home() {
  const [account, setAccount] = useState('');
  const [currentBlock, setCurrentBlock] = useState<BlockInfo>({
    height: 0,
    hash: '',
  });
  const [historicalBlocks, setHistoricalBlocks] = useState<BlockInfo[]>([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // 检查并恢复已保存的钱包地址
  useEffect(() => {
    const savedAccount = localStorage.getItem('walletAddress');
    if (savedAccount) {
      setAccount(savedAccount);
    }
  }, []);

  const fetchBlockchainData = useCallback(async () => {
    try {
      console.log('Fetching blockchain data...');
      const response = await fetch('https://api.blockchair.com/bitcoin/blocks?limit=16');
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const blocks = data.data.map((block: any) => ({
          height: Number(block.id),  // 使用 id 作为区块高度
          hash: block.hash,
          timestamp: new Date(block.time).getTime() / 1000,
          size: Number(block.size),
          weight: Number(block.weight),
          health: 99.88, // 示例值
          feeRange: [4, 178], // 示例值
          medianFee: Number(block.fee_per_kb) / 1000,
          totalFee: Number(block.fee_total) / 100000000,
          reward: Number(block.reward) / 100000000,
          miner: block.guessed_miner
        }));

        console.log('Processed blocks:', blocks);

        if (blocks[0]?.height) {
          console.log('Setting current block:', blocks[0]);
          setCurrentBlock(blocks[0]);
          setHistoricalBlocks(blocks.slice(1));
        } else {
          console.error('No valid block height found in the first block');
        }
      } else {
        console.error('No data returned from API');
      }
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
    }
  }, []);

  // 只在组件挂载时获取一次数据
  useEffect(() => {
    fetchBlockchainData();
  }, [fetchBlockchainData]);

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);
        // 保存钱包地址到 localStorage
        localStorage.setItem('walletAddress', connectedAccount);
        toast({
          title: 'Connected',
          description: 'Wallet connected successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'MetaMask Required',
          description: 'Please install MetaMask to connect your wallet',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 监听钱包账户变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          localStorage.setItem('walletAddress', newAccount);
        } else {
          setAccount('');
          localStorage.removeItem('walletAddress');
        }
      });
    }
  }, []);

  const placeBet = async () => {
    if (!account || selectedTag === null || !betAmount) return;
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        toast({
          title: 'MetaMask Required',
          description: 'Please install MetaMask to place bets',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        BetMarketABI.abi,
        signer
      );
      
      // Convert tag number to hex string and then to bytes
      const hashValue = ethers.utils.hexlify([selectedTag]);
      const tx = await contract.placeBet(hashValue, ethers.utils.parseUnits(betAmount, 18));
      await tx.wait();
      
      toast({
        title: 'Success',
        description: 'Bet placed successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      setBetAmount('');
      setSelectedTag(null);
    } catch (error) {
      console.error('Betting error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to place bet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={theme.bg.primary} minH="100vh">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Heading
              as="h1"
              size="xl"
              bgGradient={theme.gradient.primary}
              bgClip="text"
              letterSpacing="tight"
              fontWeight="extrabold"
            >
              BetMarket
            </Heading>
            <Button
              onClick={connectWallet}
              bgGradient={theme.gradient.secondary}
              color="white"
              _hover={{
                bgGradient: theme.gradient.primary,
                transform: 'translateY(-2px)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
              fontWeight="semibold"
              px={6}
              h={12}
              borderRadius="xl"
              boxShadow="0 0 20px rgba(56, 189, 248, 0.2)"
            >
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </Button>
          </HStack>

          {/* Main Content */}
          <VStack spacing={8} flex="1">
            {/* Blockchain Info Section */}
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(1, 1fr)" }}
              gap={4}
              w="full"
              maxW="container.xl"
              mx="auto"
              px={4}
            >
              <BlockchainInfo
                blockHeight={currentBlock.height}
                blockHash={currentBlock.hash}
                historicalBlocks={historicalBlocks}
              />
            </Grid>

            <Divider borderColor={theme.border.primary} />

            {/* Betting Grid */}
            <Grid 
              templateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)"
              }}
              gap={6}
            >
              {Array.from({ length: 16 }, (_, i) => {
                const tagLabel = i <= 9 ? i.toString() : String.fromCharCode(87 + i);
                return (
                  <MotionBox
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    p={6}
                    bg={theme.bg.secondary}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={theme.border.primary}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: theme.border.highlight,
                      boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
                    }}
                    onClick={() => {
                      setSelectedTag(i);
                      onOpen();
                    }}
                  >
                    <VStack spacing={4}>
                      <Box
                        bgGradient={theme.gradient.primary}
                        p={1}
                        borderRadius="full"
                        boxShadow="0 0 15px rgba(56, 189, 248, 0.3)"
                      >
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color={theme.text.primary}
                          px={4}
                          py={1}
                        >
                          {tagLabel}
                        </Text>
                      </Box>
                      <Text fontSize="sm" color={theme.text.secondary}>
                        Buy
                      </Text>
                    </VStack>
                  </MotionBox>
                );
              })}
            </Grid>
          </VStack>

          {/* Footer */}
          <Box
            w="full"
            py={6}
            mt={8}
            borderTopWidth="1px"
            borderColor={theme.border.primary}
          >
            <Text
              fontSize="sm"
              color={theme.text.secondary}
              textAlign="center"
            >
              Powered by N3LAB &copy; {new Date().getFullYear()}
            </Text>
          </Box>
        </VStack>

        {/* Betting Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
          />
          <ModalContent
            bg={theme.bg.secondary}
            borderColor={theme.border.primary}
            borderWidth="1px"
            borderRadius="xl"
            mx={4}
          >
            <ModalHeader color={theme.text.primary}>Buy Confirmation</ModalHeader>
            <ModalCloseButton color={theme.text.primary} />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel color={theme.text.primary}>Amount (USDT)</FormLabel>
                <Input
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter amount"
                  bg={theme.bg.accent}
                  color={theme.text.primary}
                  borderColor={theme.border.primary}
                  _hover={{
                    borderColor: theme.border.highlight
                  }}
                  _focus={{
                    borderColor: theme.border.highlight,
                    boxShadow: '0 0 0 1px ' + theme.border.highlight
                  }}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                bgGradient={theme.gradient.primary}
                color="white"
                mr={3}
                onClick={placeBet}
                _hover={{
                  bgGradient: theme.gradient.secondary,
                  transform: 'translateY(-2px)'
                }}
                _active={{
                  transform: 'translateY(0)'
                }}
                transition="all 0.2s"
              >
                Buy
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                color={theme.text.primary}
                _hover={{
                  bg: theme.bg.accent
                }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}
