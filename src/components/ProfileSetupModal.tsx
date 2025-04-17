import { useState, useRef, ChangeEvent, useCallback } from 'react';
import { FaTimes, FaUpload, FaSpinner, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

// react-easy-crop import
import Cropper, { Point, Area } from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage'; // 크롭 유틸리티 import

interface ProfileSetupModalProps {
  onClose: () => void;
  onProfileUpdate: (newPhotoURL: string) => void;
}

export default function ProfileSetupModal({ onClose, onProfileUpdate }: ProfileSetupModalProps) {
  const { user: currentUser, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // react-easy-crop 상태 추가
  const [imageSrc, setImageSrc] = useState<string | null>(currentUser?.photoURL || null); // 크롭할 이미지 소스
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setZoom(1); // 새 파일 선택 시 줌 초기화
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 형식 및 크기 검사는 유지
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('JPEG, PNG, GIF 파일만 업로드할 수 있습니다.');
      setImageSrc(null); // 이미지 소스 제거
      return;
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('파일 크기는 2MB를 초과할 수 없습니다.');
      setImageSrc(null);
      return;
    }

    // FileReader로 이미지 소스 설정
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
          // 원본 크기 검사는 유지 (400x400)
          if (img.naturalWidth < 400 || img.naturalHeight < 400) {
            setError('원본 이미지 가로/세로 크기는 400픽셀 이상이어야 합니다.');
            setImageSrc(null); // 크롭퍼에 이미지를 표시하지 않음
          } else {
            setImageSrc(e.target?.result as string); // 크롭퍼에 이미지 표시
          }
      };
      img.onerror = () => {
          setError('이미지 파일을 읽는 중 오류가 발생했습니다.');
          setImageSrc(null);
      }
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
        setError('파일을 읽는 중 오류가 발생했습니다.');
        setImageSrc(null);
    }
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || isLoading || !currentUser) {
        setError("이미지를 선택하고 영역을 지정해주세요.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 크롭된 이미지 생성 (결과는 PNG Blob)
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) {
        throw new Error('이미지 크롭에 실패했습니다.');
      }

      // 크롭된 Blob으로 File 객체 생성 (파일명 및 타입 수정)
      const croppedImageFile = new File([croppedImageBlob], `profile_${currentUser.uid}.png`, { type: 'image/png' }); // 파일명 확장자 및 타입 변경

      // 2. Storage에 크롭된 이미지 업로드
      const storageRef = ref(storage, `profile_pictures/${currentUser.uid}/${croppedImageFile.name}`);
      const snapshot = await uploadBytes(storageRef, croppedImageFile);
      const newPhotoURL = await getDownloadURL(snapshot.ref);

      // 3. Firestore 사용자 문서 업데이트
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: newPhotoURL,
      });

      // 4. Firebase Auth 프로필 업데이트
      await updateProfile(currentUser, {
        photoURL: newPhotoURL,
      });

      // AuthContext의 user 상태 업데이트
      setUser(prevUser => {
          if (!prevUser) return null; // 이전 사용자 없으면 null 반환
          return { ...prevUser, photoURL: newPhotoURL }; // photoURL만 업데이트
      });

      console.log('Profile picture updated successfully!');
      onProfileUpdate(newPhotoURL);
      onClose();

    } catch (err: any) {
      console.error("Error uploading profile picture:", err);
      setError(`프로필 사진 처리 중 오류: ${err.message || '다시 시도해 주세요.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Zoom 핸들러 함수 추가
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-700 p-2 rounded-full disabled:opacity-50">
            <FaTimes />
          </button>
          <h2 className="text-lg font-bold">프로필 사진 설정</h2>
          <button
            onClick={handleUpload}
            disabled={!imageSrc || !croppedAreaPixels || isLoading}
            className="bg-black text-white px-4 py-1.5 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : "저장"}
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-4">
           {/* Cropper 영역 */}
           <div className="relative w-full h-80 bg-gray-200 rounded-md overflow-hidden mb-4">
             {imageSrc ? (
               <Cropper
                 image={imageSrc}
                 crop={crop}
                 zoom={zoom}
                 aspect={1 / 1} // 1:1 비율 (정사각형)
                 onCropChange={setCrop}
                 onZoomChange={setZoom}
                 onCropComplete={onCropComplete}
                 cropShape="round" // 원형 크롭
                 showGrid={false} // 그리드 숨김
               />
             ) : (
                // 이미지가 없을 때 Placeholder 또는 안내 메시지
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                   <FaUpload className="text-4xl mb-2"/>
                   <p>사진을 선택해주세요</p>
                </div>
             )}
           </div>

           {/* Zoom 컨트롤: 아이콘 버튼 + 슬라이더 */}
           {imageSrc && (
             <div className="flex justify-center items-center gap-3 mb-4 px-4"> {/* gap 조정 및 padding 추가 */}
               {/* 축소 버튼 */}
               <button
                 onClick={handleZoomOut}
                 disabled={zoom <= 1 || isLoading}
                 className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                 aria-label="Zoom out"
               >
                 <FaSearchMinus className="text-gray-600 text-lg" /> {/* 아이콘 크기 약간 조정 */}
               </button>

               {/* 슬라이더 바 추가 */}
               <input
                 type="range"
                 value={zoom}
                 min={1}
                 max={3}
                 step={0.05} // 슬라이더 민감도
                 aria-labelledby="Zoom slider"
                 onChange={(e) => setZoom(Number(e.target.value))}
                 className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500" // accent color 추가
                 disabled={isLoading}
               />

               {/* 확대 버튼 */}
               <button
                 onClick={handleZoomIn}
                 disabled={zoom >= 3 || isLoading}
                 className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                 aria-label="Zoom in"
               >
                 <FaSearchPlus className="text-gray-600 text-lg" /> {/* 아이콘 크기 약간 조정 */}
               </button>
               {/* <span className="text-sm text-gray-700 w-10 text-center">{Math.round(zoom * 100)}%</span> */}
             </div>
           )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            disabled={isLoading}
          />

          {/* 사진 선택 버튼 (스타일 변경) */}
          <div className="flex justify-center">
            <button
              onClick={() => !isLoading && fileInputRef.current?.click()}
              disabled={isLoading}
              className="bg-blue-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {imageSrc ? '다른 사진 선택' : '사진 선택'}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
} 