import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface CourseProgressMessage {
  courseId: number;
  status: 'PENDING' | 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  message?: string;
  step?: string;
  completedChapter?: number;
  totalChapters?: number;
  chapterTitle?: string;
  chapterSummary?: string;
}


/**
 * Mở đường ống kết nối WebSocket STOMP tới Backend qua /ws-course
 * Lắng nghe kênh /topic/course/{courseId}
 */
export function subscribeCourseProgress(
  courseId: number,
  onProgress: (data: CourseProgressMessage) => void,
  onError?: (error: any) => void
): () => void {
  const wsUrl = 'http://localhost:8080/ws-course';

  const client = new Client({
    // Sử dụng SockJS làm fallback nếu trình duyệt không hỗ trợ WebSocket thuần
    webSocketFactory: () => new SockJS(wsUrl),
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log(`[WebSocket] Đã kết nối thành công tới ${wsUrl}!`);
      console.log(`[WebSocket] Đang lắng nghe kênh: /topic/course/${courseId}`);

      // Lắng nghe kênh chuẩn /topic/course/{courseId}
      client.subscribe(`/topic/course/${courseId}`, (message) => {
        try {
          const payload: CourseProgressMessage = JSON.parse(message.body);
          console.log('[WebSocket] Nhận được thông điệp từ AI:', payload);
          onProgress(payload);
        } catch (err) {
          console.error('[WebSocket] Lỗi parse JSON từ message:', err);
        }
      });

      // Fallback: lắng nghe thêm kênh /topic/course{courseId} (phòng hờ backend thiếu dấu /)
      client.subscribe(`/topic/course${courseId}`, (message) => {
        try {
          const payload: CourseProgressMessage = JSON.parse(message.body);
          onProgress(payload);
        } catch (err) {
          console.error('[WebSocket] Lỗi parse JSON (fallback topic):', err);
        }
      });
    },
    onStompError: (frame) => {
      console.error('[WebSocket] Lỗi giao thức STOMP:', frame.headers['message'], frame.body);
      if (onError) onError(frame);
    },
    onWebSocketError: (event) => {
      console.error('[WebSocket] Lỗi kết nối WebSocket:', event);
      if (onError) onError(event);
    }
  });

  // Kích hoạt kết nối
  client.activate();

  // Trả về hàm dọn dẹp để ngắt kết nối khi component unmount
  return () => {
    console.log(`[WebSocket] Đang đóng kết nối WebSocket cho khóa học #${courseId}...`);
    client.deactivate();
  };
}
