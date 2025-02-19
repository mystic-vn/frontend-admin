import { Badge } from "@/components/ui/badge";
import { CardSuit } from "@/types/tarot";
import { useMemo } from "react";

interface SuitInfoProps {
  suitName: CardSuit;
}

const suitData = {
  [CardSuit.CUPS]: {
    element: "Nước",
    meaning: "Cảm xúc, tình cảm, trực giác",
    keywords: ["Tình yêu", "Cảm xúc", "Mối quan hệ", "Trực giác"],
    description: "Suit Cups liên quan đến thế giới cảm xúc, tình cảm và các mối quan hệ. Nó phản ánh trạng thái tinh thần, trực giác và khả năng kết nối với người khác."
  },
  [CardSuit.WANDS]: {
    element: "Lửa",
    meaning: "Năng lượng, sáng tạo, hành động",
    keywords: ["Đam mê", "Sáng tạo", "Hành động", "Phiêu lưu"],
    description: "Suit Wands đại diện cho năng lượng sáng tạo, đam mê và khởi đầu mới. Nó liên quan đến sự phát triển cá nhân, tham vọng và những ý tưởng mới."
  },
  [CardSuit.PENTACLES]: {
    element: "Đất",
    meaning: "Vật chất, tài chính, sự ổn định",
    keywords: ["Tiền bạc", "Sự nghiệp", "Vật chất", "Sức khỏe"],
    description: "Suit Pentacles liên quan đến thế giới vật chất, bao gồm tiền bạc, sự nghiệp, và sức khỏe thể chất. Nó phản ánh sự ổn định và an toàn trong cuộc sống."
  },
  [CardSuit.SWORDS]: {
    element: "Không khí",
    meaning: "Trí tuệ, tư duy, giao tiếp",
    keywords: ["Lý trí", "Tư duy", "Thách thức", "Quyết định"],
    description: "Suit Swords đại diện cho thế giới của tâm trí, lý trí và giao tiếp. Nó liên quan đến những thách thức, quyết định và cách chúng ta xử lý các vấn đề."
  }
};

export function SuitInfo({ suitName }: SuitInfoProps) {
  const suitInfo = useMemo(() => {
    if (suitName === CardSuit.NONE) return null;
    return suitData[suitName];
  }, [suitName]);

  if (!suitInfo) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-medium">Yếu tố:</span>
        <Badge variant="outline">{suitInfo.element}</Badge>
      </div>
      <div>
        <span className="font-medium">Ý nghĩa:</span>
        <p className="mt-1 text-sm text-muted-foreground">{suitInfo.meaning}</p>
      </div>
      <div>
        <span className="font-medium">Từ khóa:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {suitInfo.keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <span className="font-medium">Mô tả:</span>
        <p className="mt-1 text-sm text-muted-foreground">{suitInfo.description}</p>
      </div>
    </div>
  );
} 