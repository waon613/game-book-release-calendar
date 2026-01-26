"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface ScoreFilterProps {
  selectedScores: number[];
  onChange: (scores: number[]) => void;
}

const SCORE_OPTIONS = [
  { value: 90, label: "90点以上", description: "神ゲー" },
  { value: 80, label: "80点以上", description: "名作" },
  { value: 70, label: "70点以上", description: "良作" },
  { value: 0, label: "すべて", description: "" },
];

export function ScoreFilter({ selectedScores, onChange }: ScoreFilterProps) {
  const handleChange = (score: number, checked: boolean) => {
    if (score === 0) {
      // 「すべて」を選択した場合
      if (checked) {
        onChange([0]);
      }
    } else {
      // 特定スコアを選択した場合
      let newScores = selectedScores.filter((s) => s !== 0);
      if (checked) {
        newScores = [...newScores, score];
      } else {
        newScores = newScores.filter((s) => s !== score);
      }
      // 何も選択されていなければ「すべて」を選択
      if (newScores.length === 0) {
        newScores = [0];
      }
      onChange(newScores);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">評価スコア</label>
      <div className="space-y-2">
        {SCORE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`score-${option.value}`}
              checked={selectedScores.includes(option.value)}
              onCheckedChange={(checked) =>
                handleChange(option.value, checked === true)
              }
            />
            <label
              htmlFor={`score-${option.value}`}
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              {option.label}
              {option.description && (
                <span className="text-xs text-muted-foreground">
                  ({option.description})
                </span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
