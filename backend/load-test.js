import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. 測試設定：定義負載階段 (Stages)
export const options = {
  stages: [
    { duration: '10s', target: 5 }, // 30秒內爬升到 20 個虛擬用戶
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 的請求必須在 500ms 內完成
    http_req_failed: ['rate<0.01'],   // 錯誤率必須低於 1%
  },
};

// 2. 測試執行邏輯
export default function () {
  const BASE_URL = 'http://localhost:8888/api/v1/todos';

  const res = http.get(BASE_URL);

  // 驗證回應
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body contains todos': (r) => r.body.includes('todos'),
  });

  // 模擬使用者行為間隔，避免過度頻繁攻擊
  sleep(1);
}