interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4">게시물 삭제</h2>
        <p className="text-gray-600 mb-6">이 게시물을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
} 