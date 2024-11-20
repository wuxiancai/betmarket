import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Link,
  Tooltip,
  Icon,
  Grid,
  GridItem,
  Flex,
  Circle,
  Collapse,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { FiClock, FiHash, FiLayers, FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// 使用与主页面相同的主题
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

interface BlockchainInfoProps {
  blockHeight: number;
  blockHash: string;
  historicalBlocks: BlockInfo[];
}

const BlockchainInfo: React.FC<BlockchainInfoProps> = ({
  blockHeight,
  blockHash,
  historicalBlocks,
}) => {
  const { isOpen, onToggle } = useDisclosure();

  console.log('BlockchainInfo props:', { blockHeight, blockHash, historicalBlocks });

  const formatBlockHeight = (height: number) => {
    console.log('Formatting block height:', height);
    if (!height && height !== 0) return '...';
    return height.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatHash = (hash: string | undefined) => {
    if (!hash) return 'Loading...';
    const start = hash.slice(0, 8);
    const end = hash.slice(-8);
    return `${start}...${end}`;
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    const timeAgo = Math.floor((Date.now() - date.getTime()) / (60 * 1000));
    return `${date.toLocaleString()} (${timeAgo}分钟之前)`;
  };

  const formatTime = (seconds: number) => {
    if (typeof seconds !== 'number') return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatWeight = (weight?: number) => {
    if (!weight) return 'N/A';
    return (weight / (1024 * 1024)).toFixed(2) + ' MWU';
  };

  const formatFee = (fee?: number) => {
    if (!fee) return 'N/A';
    return `${fee} 聪/字节`;
  };

  const formatBTC = (btc?: number) => {
    if (!btc) return 'N/A';
    return `${btc.toFixed(3)} BTC`;
  };

  // Calculate frequency of last characters in recent block hashes
  const getLastCharFrequency = () => {
    if (!historicalBlocks || historicalBlocks.length === 0) return 'N/A';
    
    // Get last characters from block hashes
    const lastChars = historicalBlocks
      .slice(0, 16)
      .map(block => block.hash?.slice(-1))
      .filter(char => char) // Filter out undefined/null values
      .reduce((acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Sort by character and format
    return Object.entries(lastChars)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([char, count]) => `${char}:${count}`)
      .join(' ');
  };

  return (
    <VStack spacing={4} w="full">
      <Grid
        templateColumns={{ base: "1fr", md: "auto 1fr" }}
        gap={4}
        p={4}
        w="full"
        alignItems="center"
      >
        {/* Block Height Section */}
        <GridItem>
          <Popover trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Box
                bg={theme.bg.secondary}
                p={4}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={theme.border.primary}
                display="flex"
                alignItems="center"
                gap={3}
                _hover={{
                  borderColor: theme.border.highlight,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                }}
                cursor="pointer"
              >
                <Circle size="32px" bg={theme.bg.accent}>
                  <Icon as={FiLayers} color={theme.text.accent} boxSize={4} />
                </Circle>
                <Box>
                  <Text fontSize="sm" color={theme.text.secondary}>
                    Current Block
                  </Text>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="bold"
                    fontFamily="mono"
                    bgGradient={theme.gradient.primary}
                    bgClip="text"
                    display="block"
                    overflow="visible"
                    whiteSpace="nowrap"
                  >
                    #{blockHeight ? formatBlockHeight(blockHeight) : '...'}
                  </Text>
                </Box>
              </Box>
            </PopoverTrigger>
            <Portal>
              <PopoverContent
                bg={theme.bg.primary}
                borderColor={theme.border.primary}
                _hover={{ borderColor: theme.border.highlight }}
                w="auto"
                minW="300px"
              >
                <PopoverBody p={4}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>区块高度</Text>
                      <Text color={theme.text.primary} fontFamily="mono" fontWeight="bold">
                        #{formatBlockHeight(blockHeight)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>哈希值</Text>
                      <Text color={theme.text.primary} fontFamily="mono">{formatHash(blockHash)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>最近16区块末位字符频率</Text>
                      <Text color={theme.text.primary} fontFamily="mono">{getLastCharFrequency()}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>时间戳</Text>
                      <Text color={theme.text.primary}>{formatTimestamp(historicalBlocks[0]?.timestamp)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>大小</Text>
                      <Text color={theme.text.primary}>{formatSize(historicalBlocks[0]?.size)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>权重</Text>
                      <Text color={theme.text.primary}>{formatWeight(historicalBlocks[0]?.weight)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>健康度</Text>
                      <Text color={theme.text.primary}>{historicalBlocks[0]?.health?.toFixed(2)}%</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>费用范围</Text>
                      <Text color={theme.text.primary}>
                        {historicalBlocks[0]?.feeRange ? 
                          `${formatFee(historicalBlocks[0].feeRange[0])} - ${formatFee(historicalBlocks[0].feeRange[1])}` 
                          : 'N/A'}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>中位矿工手续费</Text>
                      <Text color={theme.text.primary}>{formatFee(historicalBlocks[0]?.medianFee)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>总手续费</Text>
                      <Text color={theme.text.primary}>{formatBTC(historicalBlocks[0]?.totalFee)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>补贴+费用</Text>
                      <Text color={theme.text.primary}>{formatBTC(historicalBlocks[0]?.reward)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color={theme.text.secondary}>矿工</Text>
                      <Text color={theme.text.primary}>{historicalBlocks[0]?.miner || 'N/A'}</Text>
                    </HStack>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        </GridItem>

        {/* Block Hash Section */}
        <GridItem>
          <Box
            bg={theme.bg.secondary}
            p={4}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={theme.border.primary}
            _hover={{
              borderColor: theme.border.highlight,
              transform: 'translateY(-2px)',
              transition: 'all 0.2s',
            }}
          >
            <HStack spacing={3}>
              <Circle size="32px" bg={theme.bg.accent} flexShrink={0}>
                <Icon as={FiHash} color={theme.text.accent} boxSize={4} />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color={theme.text.secondary}>
                  Block Hash
                </Text>
                <HStack spacing={2}>
                  <Tooltip label={blockHash} placement="bottom">
                    <Text
                      fontSize="md"
                      fontFamily="mono"
                      color={theme.text.primary}
                      isTruncated
                    >
                      {formatHash(blockHash)}
                    </Text>
                  </Tooltip>
                  <Tooltip label="Copy to clipboard">
                    <Link
                      onClick={() => navigator.clipboard.writeText(blockHash)}
                      _hover={{ color: theme.text.accent }}
                    >
                      <Icon as={FiCopy} color={theme.text.secondary} boxSize={4} />
                    </Link>
                  </Tooltip>
                </HStack>
              </VStack>
            </HStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Historical Blocks Section */}
      <Box w="full" px={6}>
        <Button
          onClick={onToggle}
          variant="ghost"
          w="full"
          color={theme.text.secondary}
          _hover={{ bg: theme.bg.accent }}
          leftIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
          mb={2}
        >
          Recent Blocks History (Last 16)
        </Button>
        <Collapse in={isOpen} animateOpacity>
          <Box
            bg={theme.bg.secondary}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={theme.border.primary}
            overflow="hidden"
          >
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color={theme.text.secondary} borderColor={theme.border.primary}>Height</Th>
                  <Th color={theme.text.secondary} borderColor={theme.border.primary}>Hash</Th>
                </Tr>
              </Thead>
              <Tbody>
                {historicalBlocks.slice(0, 16).map((block, index) => (
                  <Tr key={block.height} 
                      _hover={{ bg: theme.bg.accent }}
                      transition="background-color 0.2s">
                    <Td color={theme.text.primary} borderColor={theme.border.primary}>
                      #{formatBlockHeight(block.height)}
                    </Td>
                    <Td color={theme.text.primary} borderColor={theme.border.primary}>
                      <Flex align="center">
                        <Tooltip label={block.hash} placement="top">
                          <Text flex={1} fontFamily="mono">
                            {formatHash(block.hash)}
                          </Text>
                        </Tooltip>
                        <Tooltip label="Copy to clipboard">
                          <Link
                            onClick={() => navigator.clipboard.writeText(block.hash)}
                            _hover={{ color: theme.text.accent }}
                            ml={2}
                          >
                            <Icon as={FiCopy} color={theme.text.secondary} boxSize={3} />
                          </Link>
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Collapse>
      </Box>
    </VStack>
  );
};

export default BlockchainInfo;
