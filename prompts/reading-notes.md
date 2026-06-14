# Reading Design Notes

This file is for future divination method design.

## Open Questions

- Should Skill and Action cards both support upright and reversed positions?
- Should Believer cards be drawn as normal cards, or used as strength/tone/modifier cards?
- Should readings use fixed spreads, free draws, or question-based prompts?
- Should AI interpretation read only the filled card meanings, or also use the original card mechanics as symbolic context?

## Possible Data Flow

1. Draw cards from `data/cards.json`.
2. Attach position data: upright, reversed, or modifier.
3. Combine user question, selected spread, and card meanings.
4. Generate interpretation from a local template or an AI prompt.

## Current Reading Structure

- Main reading deck: Skill cards and Action cards only, 31 cards total.
- Main cards do not repeat within the same reading, following ordinary card-reading logic.
- Main cards may appear upright or reversed.
- Believer cards are not independent event cards and do not use upright or reversed meanings for now.
- For each main card, optionally draw one Believer card as a repeatable supplement card.
- Believer cards express the faith intensity, signal strength, weight, manifestation level, or interpretive volume of the attached main card.
- Believer cards may repeat because they measure strength rather than occupying a unique event slot.

## Believer Strength Scale

| Believer | Strength | Reading Use |
| --- | --- | --- |
| Fool / 愚民 | 1 | 微弱、背景化、短暫、尚未成形。主牌存在，但不宜放大。 |
| Prayer / 平信者 | 2 | 輕度、有感、日常影響。主牌可被感受到，但通常不是核心。 |
| Missionary / 傳教士 | 3 | 中度、明確、正在作用。需要認真納入解讀。 |
| Elder / 長老 | 4 | 高度、穩定、結構性。通常是重要因素，不是一時情緒。 |
| Fanatic / 狂信者 | 5 | 極強、主導、壓倒性。通常是整體解讀核心。 |

## Comparing Believer Weights

- Difference 0: 力量相當，兩張主牌都重要，需要共同解讀，不宜單方向肯定。
- Difference 1: 略有偏重，高者稍微主導，低者仍有明顯影響。
- Difference 2: 主次分明，高者是主要因素，低者是輔助、限制或干擾。
- Difference 3-4: 高者強烈主導，低者仍存在，但多半只是微弱提示、有限解法或背景條件。

## Example Weight Readings

- Faith War / 信仰戰爭 + Fool / 愚民 1, and Great Mercy / 大發慈悲 + Fanatic / 狂信者 5: 衝突存在但不主導，寬容、安撫或給台階是主導解法，包容有較高機會化解局面。
- Faith War / 信仰戰爭 + Missionary / 傳教士 3, and Great Mercy / 大發慈悲 + Missionary / 傳教士 3: 衝突在所難免，但包容也同樣有作用。解讀應保留兩股力量並重，只能說可考慮包容，或許有良好效果。
- Faith War / 信仰戰爭 + Fanatic / 狂信者 5, and Great Mercy / 大發慈悲 + Fool / 愚民 1: 衝突強、慈悲弱，包容不是輕鬆主導局面的解法；可能需要考慮退讓、被迫包容或降低傷害，但整體仍以衝突壓力為主。

## Three-Card Faith Field Reading

This deck does not need to follow a traditional past / present / future spread. Its core system is faith intensity, mental force, and how strongly each symbolic force is manifesting in the same situation.

For the default three-card reading, use three reading positions:

| Position | Meaning |
| --- | --- |
| 局勢主軸 | The force currently shaping the situation most directly. It is the grammar position for what appears to be leading the field. |
| 影響因素 | The force that complicates, distorts, pressures, blocks, or makes the situation harder to read. |
| 建議方向 | The force that may become an adjustment, response, release valve, or practical direction. |

The position gives grammar; the Believer card gives volume. Do not read the three cards mechanically from left to right. First identify the highest Believer strength, then decide which position truly dominates the narrative.

Special case: 1 / 1 / 1

When all three Believer cards are Fool / 愚民 1, the reading should not be treated as three equally important forces. Instead, read it as a weak field: the issue has signs, hints, or background possibilities, but none of the forces has strongly formed yet. The reading should stay flexible and observational. It may indicate that the question is too early, the situation has not fermented, or the querent is asking before the matter has enough momentum.

Suggested wording: 三張都是愚民 1，代表這題現在還沒發酵。牌面不是沒有訊息，而是訊息還很輕；先把三張牌當成觀察清單，之後哪個跡象開始變強，哪個方向才會變成真正主軸。

## Physical Card Input Mode

The website supports a physical-card input mode for players who own the game and want to draw the cards themselves. This mode must use dropdown selectors rather than free text, because the card pool is fixed and official card names should not be mistyped.

Manual mode rules:

- The user selects three main cards from the fixed Skill + Action card list.
- Main cards cannot repeat.
- The user selects upright or reversed for each main card.
- The user selects one Believer strength for each main card; Believer strengths may repeat.
- Because the user is not assigning reading positions directly, the site infers positions from Believer strength: highest = 局勢主軸, middle = 影響因素, lowest = 建議方向.
- If strengths tie, keep input order for tied cards and show a note that same-strength forces should be read together.
- If all three strengths are the same, positions are only reading grammar, not true hierarchy.
- Default spread is fixed to three cards: 局勢主軸 / 影響因素 / 建議方向. Single-card reading was removed because the Believer strength system needs comparison between multiple forces.

- Both website draw mode and physical-card input mode infer positions from Believer strength: highest = 局勢主軸, middle = 影響因素, lowest = 建議方向. Ties keep draw/input order and should be read as same-level forces.
