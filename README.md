# Internet Project

## 功能
* 即時聊天室，可以回顧歷史訊息，但如果重新整理會清除歷史訊息，用到socket.io
* 登入登出註冊
* cookie-session，一小時內只要不登出可以不用再登入
* 影音串流，用Hls Server完成，但只有兩個影片
* 有用資料庫(MongoDB)存留言和session


## 編譯/執行
要有node、yarn。
    
        先 **yarn** 載package，再來就 **yarn server**
    但照理來說直接來應該執行不了，
    因為我沒有把 .env包含進壓縮檔，所以連不到mongodb。

      如果要本地測試，可以去辦一個mongoDB，
    然後弄一個.env跟server.js同目錄，
    內容可以參考.env.defaults


## PORT 
預設是3000

