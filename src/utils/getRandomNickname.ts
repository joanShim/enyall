/**
 * 아티스트 관련 랜덤 닉네임 생성 유틸리티 함수
 * @returns {string} 생성된 랜덤 닉네임
 */
export function generateRandomNickname() {
  // 형용사 풀 (감성/분위기)
  const adjectives = ["섬세한", "신비로운", "청량한", "몽환적인", "우아한"];

  // 특성 풀 (기술/재능)
  const skills = [
    "가창력의",
    "하이노트의",
    "저음의",
    "춤사위의",
    "발재간의",
    "제스처의",
    "표정의",
    "리듬감의",
    "기타",
    "드럼",
    "피아노",
    "베이스",
    "감성의",
    "그루브의",
    "아우라의",
    "존재감의",
  ];

  // 외모 특징 풀
  const features = [
    "흑발",
    "금발",
    "은발",
    "붉은머리",
    "분홍머리",
    "파랑머리",
    "주황머리",
    "장발",
    "단발",
    "웨이브",
    "포니테일",
    "피어싱",
    "윙크",
    "썸네일",
  ];

  // 각 카테고리에서 랜덤 단어 선택
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomSkill = skills[Math.floor(Math.random() * skills.length)];
  const randomFeature = features[Math.floor(Math.random() * features.length)];

  // 닉네임 조합
  return `${randomAdjective} ${randomSkill} ${randomFeature}`;
}
