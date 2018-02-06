# nodejs_memorygame

## 線上記憶力遊戲<br>
這是與組員共同開發的記憶力遊戲<br>
以Facebook登入後<br>
玩家需要在線上排隊待至房間滿四人即可開始遊戲<br>

<br>

### 遊戲規則 <br>
四個玩家輪流，輪到該玩家可以翻牌，翻到一樣數字則得10分並繼續翻，直到翻到兩個不同的數字<br>
翻到不同數字則換下一個序列的玩家翻牌，原本的玩家就會進入序列等待，除輪到玩家之外其餘玩家都是等待順序輪到自己<br>
將牌翻完時獲得分數最高的玩家勝利，遊戲結束後會自動跳回等待大廳<br>

#### 所用技術<br>
- 使用 Node.js 建成並使用 Heroku 作為 APP 平台
- Github 專案為版本控制
- 連接 Google Firebase 為資料庫
- 使用 Facebook API 為登入功能
- Socket.io 多人即時通訊

### 實際Demo： http://fb-nodejs-pokergame.herokuapp.com/
