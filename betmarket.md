# 完整技术文档：智能合约下注平台

**项目概述**

开发一个带有智能合约交互功能的网站，核心功能包括用户登录、下注、资金分配、实时区块链信息显示和多标签投注逻辑。用户通过 MetaMask 登录后，可选择标签下注，根据区块链区块的 Hash 值决定胜负，输赢资金通过智能合约自动分配。页面还需显示实时区块高度、Hash 值及预测的下一区块出块时间。每个标签实时的已下注资金。

**功能模块设计**

**用户登录模块**

功能描述：用户通过点击登录按钮触发 MetaMask 弹窗进行以太坊地址的连接。

实现步骤：

1.	使用 MetaMask 的 ethereum.request 方法实现用户地址获取。

2.	页面加载时检查用户是否已连接 MetaMask。

3.	如果未连接，禁用下注按钮。

```jsx
const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected account:', accounts[0]);
            // 启用下注按钮
            document.querySelectorAll('.order-button').forEach(button => button.disabled = false);
        } catch (error) {
            console.error('MetaMask connection failed:', error);
        }
    } else {
        alert('MetaMask is not installed. Please install it to use this site.');
    }
};
document.getElementById('login-button').addEventListener('click', connectWallet);
```

**下注模块**

功能描述：每个标签下均有一个“下单”按钮，用户点击后输入下注金额并调用智能合约完成下注。只有登录后才能下注。

实现步骤：

1.	确保用户已登录，否则弹出提示。

2.	用户点击下单按钮时弹出下注金额输入框。

3.	使用 MetaMask 弹出智能合约签名交易界面，将金额和下注标签发送到合约。

```jsx
const placeBet = async (tag) => {
    const amount = prompt('请输入下注金额（USDT）：');
    if (!amount || isNaN(amount)) {
        alert('请输入有效的金额');
        return;
    }

    try {
        const transaction = {
            to: '合约地址', // 替换为智能合约地址
            value: 0, // USDT 通常是 ERC20，需要使用合约方法
            data: generateBetData(tag, amount), // 调用下注函数的 ABI 编码数据
        };
        const txHash = await ethereum.request({ method: 'eth_sendTransaction', params: [transaction] });
        console.log('Transaction sent:', txHash);
    } catch (error) {
        console.error('Transaction failed:', error);
    }
};
```

**智能合约模块**

功能描述：根据用户下注金额和区块链 Hash 的最后一位数字，计算输赢并分配资金。

实现逻辑：

1.	定义下注函数 placeBet(uint tag, uint amount)，记录用户下注金额和标签。

2.	每当新的区块生成时，检查其 Hash 值最后一位是否与标签匹配。若匹配此标签判定为赢，其他标签判定为输；所有下单赢标签的用户可以拿回自己的下单金额；所有输标签地址里的所有金额通过智能合约自动转到平台地址；

3.	分配资金，统计赢标签地址里所有下注金额，计算赢标签用户下注金额占赢标签总金额的百分比，然后把所有输标签地址相加的总额的 99.9%按这个百分比分配所有赢标签下的用户；

4.	使用 ERC20 合约的 transfer 方法完成资金转账。

```jsx
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BettingGame {
    struct Bet {
        address user;
        uint256 tag;
        uint256 amount;
    }

    mapping(uint256 => Bet[]) public bets;
    mapping(uint256 => uint256) public totalBets;

    address[16] public tagAddresses; // 16个标签对应的USDT地址

    function placeBet(uint256 tag, uint256 amount) external {
        require(tag < 16, "Invalid tag");
        require(amount > 0, "Amount must be greater than 0");

        // 转移用户下注金额到合约
        IERC20 usdt = IERC20(USDT_ADDRESS);
        require(usdt.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        bets[tag].push(Bet(msg.sender, tag, amount));
        totalBets[tag] += amount;
    }

    function resolveBet(uint256 winningTag) external {
        uint256 totalLosingAmount = 0;
        for (uint256 i = 0; i < 16; i++) {
            if (i != winningTag) totalLosingAmount += totalBets[i];
        }

        for (uint256 i = 0; i < bets[winningTag].length; i++) {
            Bet memory bet = bets[winningTag][i];
            uint256 reward = (totalLosingAmount * bet.amount) / totalBets[winningTag];
            IERC20 usdt = IERC20(USDT_ADDRESS);
            require(usdt.transfer(bet.user, reward + bet.amount), "Payout failed");
        }

        // 清空投注记录
        delete bets[winningTag];
    }
}
```

**区块链信息显示模块**

功能描述：实时显示当前区块高度、Hash 值、下一区块高度及预计出块时间。

实现步骤：

1.	通过链上 API 获取最新区块高度和 Hash 值。

2.	计算下一区块高度为当前区块高度 +1。

3.	显示下一区块预计出块时间为当前时间 +10 分钟。

4. 参考这个网站设计区块高度、HASH 等数据的显示。https://mempool.space/

示例代码：

```jsx
const fetchBlockData = async () => {
    try {
        const currentHeight = await axios.get('https://blockstream.info/api/blocks/tip/height');
        const currentHash = await axios.get(`https://blockstream.info/api/block-height/${currentHeight.data}`);
        const nextBlockTime = new Date(Date.now() + 10 * 60 * 1000);

        document.getElementById('current-height').innerText = currentHeight.data;
        document.getElementById('current-hash').innerText = currentHash.data;
        document.getElementById('next-height').innerText = currentHeight.data + 1;
        document.getElementById('next-time').innerText = nextBlockTime.toLocaleString();
    } catch (error) {
        console.error('Failed to fetch block data:', error);
    }
};
setInterval(fetchBlockData, 60 * 1000);
fetchBlockData();
```

**页面布局设计**

页面顶部显示区块链信息，中部显示标签和按钮，底部显示用户操作提示。使用 Tailwind CSS 优化样式。

```jsx
<div class="bg-gray-100 p-4">
  <div class="mb-4">
    <p>区块高度：<span id="current-height"></span> | Hash：<span id="current-hash"></span></p>
    <p>下一区块：<span id="next-height"></span> | 预计时间：<span id="next-time"></span></p>
  </div>
  <div class="grid grid-cols-4 gap-4">
    <div v-for="tag in tags" :key="tag" class="p-2 border rounded">
      <p>{{ tag }}</p>
      <button class="order-button bg-blue-500 text-white p-2 rounded" :data-tag="tag">下单</button>
    </div>
  </div>
</div>
```

可参考这个页面布局 BTC 区块高度显示和 HASH 显示：

![image.png](%E5%AE%8C%E6%95%B4%E6%8A%80%E6%9C%AF%E6%96%87%E6%A1%A3%EF%BC%9A%E6%99%BA%E8%83%BD%E5%90%88%E7%BA%A6%E4%B8%8B%E6%B3%A8%E5%B9%B3%E5%8F%B0%20141127e80ba280eaa84befdf6178a82d/image.png)

**项目结构**

•	**前端**：React + Tailwind CSS，使用 Axios 获取区块链数据，调用智能合约。

•	**后端**：Node.js 提供统一 API 接口（可选）。

•	**智能合约**：Solidity 实现下注逻辑及资金分配。

**测试计划**

1.	测试 MetaMask 登录是否正常弹出及地址读取。

2.	测试下注金额是否正确传递给智能合约。

3.	模拟多个用户下注，检查输赢资金分配逻辑。

4.	验证区块链数据实时刷新及显示是否准确。

5.	测试界面布局和交互是否符合预期，尤其是移动端适配。

**部署**

•	**前端**：Vercel 或 AWS S3 + CloudFront。

•	**智能合约**：部署到以太坊或兼容链上，使用 Remix 或 Hardhat 测试并部署。

•	**后端**：使用 PM2 部署 Node.js 服务，或无服务器架构（如 AWS Lambda）。