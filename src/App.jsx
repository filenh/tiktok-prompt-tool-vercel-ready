import React, { useMemo, useRef, useState } from "react";
import "./style.css";

const promptTypes = [
  { id: "viral", label: "Tạo video viral", icon: "🔥" },
  { id: "hook", label: "Tạo hook", icon: "🧲" },
  { id: "script", label: "Tối ưu script", icon: "🎬" },
  { id: "remix", label: "Nhân bản ý tưởng", icon: "🔁" },
  { id: "caption", label: "Caption + hashtag", icon: "📈" },
  { id: "retention", label: "Phân tích retention", icon: "🧠" },
  { id: "shotlist", label: "Shot list", icon: "🎥" },
  { id: "trend", label: "Bắt trend", icon: "💥" },
  { id: "fix", label: "Fix video view thấp", icon: "⚡" },
  { id: "abtest", label: "A/B test hook", icon: "🧪" },
];

const defaults = {
  niche: "đồ ăn healthy / eat clean",
  audience: "người muốn ăn ngon nhưng vẫn giữ dáng",
  goal: "tăng view và chuyển đổi người xem thành khách hàng",
  topic: "bánh yến mạch healthy dễ làm",
  script: "",
  trend: "",
  views: "800",
  hook: "",
  hashtags: "#banhyenmach #healthyfood #eatclean #monngonmoingay",
};

function buildPrompt({ type, niche, audience, goal, topic, script, trend, views, hook, hashtags }) {
  const safeScript = script || "[Dán script hiện tại của bạn vào đây]";
  const safeTrend = trend || "[Mô tả trend TikTok bạn muốn bắt]";
  const safeHook = hook || "[Hook đã dùng]";

  const templates = {
    viral: `Bạn là chuyên gia chiến lược nội dung TikTok tại Việt Nam.

Hãy tạo 1 ý tưởng video TikTok có khả năng viral trong niche: ${niche}

Đối tượng mục tiêu: ${audience}
Mục tiêu video: ${goal}
Chủ đề video: ${topic}

Output cần có:
1. 5 hook viral cho 3 giây đầu
2. Script đầy đủ 15–30 giây, nhịp nhanh, không lan man
3. Shot list chi tiết từng cảnh
4. Text hiển thị trên màn hình
5. Caption tối ưu tương tác
6. 8 hashtag gồm: hashtag lớn, hashtag niche, hashtag ít cạnh tranh
7. Cách tạo loop để người xem xem lại

Yêu cầu:
- Ngôn ngữ tự nhiên, giống TikTok Việt Nam
- Hook phải gây tò mò mạnh
- Có pattern interrupt mỗi 3–5 giây
- Tối ưu retention và khả năng share/save`,

    hook: `Tạo 15 hook TikTok tiếng Việt cho video về: ${topic}

Niche: ${niche}
Đối tượng mục tiêu: ${audience}

Yêu cầu:
- Tối đa 12 từ mỗi hook
- Gây tò mò trong 2 giây đầu
- Có cảm xúc: bất ngờ, tò mò, sợ bỏ lỡ, hoặc relatable
- Không viết chung chung
- Phù hợp phong cách TikTok Việt Nam

Chia hook thành 5 nhóm:
1. Hook gây shock
2. Hook lỗi sai
3. Hook bí mật
4. Hook before/after
5. Hook storytelling`,

    script: `Rewrite lại script TikTok này để tăng retention:

${safeScript}

Niche: ${niche}
Đối tượng mục tiêu: ${audience}
Mục tiêu: ${goal}

Hãy cải thiện:
1. Hook mạnh hơn trong 2 giây đầu
2. Câu ngắn hơn, dễ nghe hơn
3. Nhịp nhanh hơn
4. Thêm pattern interrupt mỗi 3–5 giây
5. Tăng curiosity gap
6. Thêm loop ending

Giữ script dưới 25 giây.
Viết tự nhiên, đời thường, không giống quảng cáo.`,

    remix: `Từ ý tưởng TikTok này: ${topic}

Niche: ${niche}
Đối tượng mục tiêu: ${audience}

Tạo 10 phiên bản video khác nhau từ cùng một ý tưởng.

Mỗi phiên bản cần có:
1. Hook riêng
2. Angle nội dung riêng
3. Format riêng: POV, lỗi sai, tutorial, review, before/after, storytime, myth-busting, checklist
4. Script ngắn 15–25 giây
5. Caption ngắn

Mục tiêu: tạo nhiều video mà không bị trùng lặp nội dung.`,

    caption: `Viết caption TikTok cho video sau:

Chủ đề: ${topic}
Niche: ${niche}
Đối tượng: ${audience}
Mục tiêu: ${goal}

Output:
1. 5 caption ngắn, tự nhiên, dễ tương tác
2. 3 caption dạng bán hàng mềm
3. 3 caption dạng storytelling
4. 10 hashtag gồm:
   - 3 hashtag lớn
   - 4 hashtag niche
   - 3 hashtag ít cạnh tranh

Yêu cầu caption:
- Không quá quảng cáo
- Có CTA nhẹ như: lưu lại, comment, follow, hoặc hỏi ý kiến`,

    retention: `Phân tích concept TikTok này để tăng retention:

Chủ đề: ${topic}
Niche: ${niche}
Đối tượng: ${audience}

Hãy cho tôi:
1. Lý do người xem có thể lướt qua trong 3 giây đầu
2. Cách sửa hook
3. Chỗ nào dễ bị drop-off
4. Cách thêm pattern interrupt
5. Cách tạo loop ending
6. 5 thay đổi nhỏ để tăng watch time
7. Version mới tối ưu hơn

Trả lời thẳng, cụ thể, ưu tiên thực chiến.`,

    shotlist: `Tạo shot list chi tiết cho video TikTok:

Chủ đề: ${topic}
Niche: ${niche}
Đối tượng: ${audience}
Thời lượng mong muốn: 15–30 giây

Output dạng bảng gồm:
1. Thời gian từng cảnh
2. Cảnh quay
3. Góc máy
4. Hành động trong cảnh
5. Text trên màn hình
6. Voice-over
7. Gợi ý chuyển cảnh

Tối ưu cho:
- Cắt nhanh
- Hình ảnh rõ ràng
- Dễ quay bằng điện thoại
- Giữ chân người xem đến cuối video`,

    trend: `Dựa trên trend TikTok này:

${safeTrend}

Hãy adapt trend này sang niche: ${niche}
Chủ đề muốn làm: ${topic}
Đối tượng: ${audience}

Output:
1. 5 ý tưởng video dùng trend này
2. Hook cho từng video
3. Cách quay chi tiết
4. Text trên màn hình
5. Caption
6. Vì sao angle này có khả năng viral

Không copy y chang trend. Hãy biến nó thành nội dung tự nhiên, phù hợp TikTok Việt Nam.`,

    fix: `Video TikTok này chỉ được ${views} views.

Niche: ${niche}
Chủ đề: ${topic}
Hook đã dùng: ${safeHook}
Hashtag đã dùng: ${hashtags}

Hãy phân tích vì sao video flop.

Sau đó đưa ra:
1. 5 hook mới mạnh hơn
2. Angle nội dung tốt hơn
3. Script mới 15–25 giây
4. Shot list mới
5. Caption mới
6. Bộ hashtag mới
7. 3 version để test lại

Mục tiêu: tối ưu để đạt 5k–10k views organic.`,

    abtest: `Tạo 5 version A/B test cho video TikTok này:

Chủ đề: ${topic}
Niche: ${niche}
Đối tượng: ${audience}

Chỉ thay đổi:
- Hook
- 5 giây đầu

Giữ nguyên phần còn lại.

Mỗi version cần có:
1. Hook
2. 5 giây đầu nên nói gì
3. Visual mở đầu nên quay gì
4. Text trên màn hình
5. Vì sao version này đáng test

Mục tiêu: tìm version có retention cao nhất.`,
  };

  return templates[type] || templates.viral;
}

function runSelfTests() {
  const baseInput = { type: "viral", ...defaults };
  const viralPrompt = buildPrompt(baseInput);
  const scriptPrompt = buildPrompt({ ...baseInput, type: "script" });
  const trendPrompt = buildPrompt({ ...baseInput, type: "trend" });
  const fallbackPrompt = buildPrompt({ ...baseInput, type: "unknown-type" });

  return [
    { name: "Viral prompt includes topic", pass: viralPrompt.includes(defaults.topic) },
    { name: "Script prompt fallback works", pass: scriptPrompt.includes("[Dán script hiện tại của bạn vào đây]") },
    { name: "Trend prompt fallback works", pass: trendPrompt.includes("[Mô tả trend TikTok bạn muốn bắt]") },
    { name: "Unknown type falls back", pass: fallbackPrompt.includes("chuyên gia chiến lược nội dung TikTok") },
    { name: "Prompt type list has 10 items", pass: promptTypes.length === 10 },
    { name: "Every prompt type has data", pass: promptTypes.every((item) => item.id && item.label && item.icon) },
  ];
}

function copyTextFallback(text, textareaRef) {
  const textarea = textareaRef.current;
  if (textarea) {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
  }

  try {
    if (typeof document !== "undefined" && document.execCommand) {
      return document.execCommand("copy");
    }
  } catch {
    return false;
  }

  return false;
}

export default function App() {
  const [type, setType] = useState("viral");
  const [niche, setNiche] = useState(defaults.niche);
  const [audience, setAudience] = useState(defaults.audience);
  const [goal, setGoal] = useState(defaults.goal);
  const [topic, setTopic] = useState(defaults.topic);
  const [script, setScript] = useState(defaults.script);
  const [trend, setTrend] = useState(defaults.trend);
  const [views, setViews] = useState(defaults.views);
  const [hook, setHook] = useState(defaults.hook);
  const [hashtags, setHashtags] = useState(defaults.hashtags);
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");
  const [showTests, setShowTests] = useState(false);
  const promptTextareaRef = useRef(null);

  const generatedPrompt = useMemo(
    () => buildPrompt({ type, niche, audience, goal, topic, script, trend, views, hook, hashtags }),
    [type, niche, audience, goal, topic, script, trend, views, hook, hashtags]
  );

  const testResults = useMemo(() => runSelfTests(), []);

  const copyPrompt = async () => {
    setCopyStatus("idle");
    let success = false;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedPrompt);
        success = true;
      }
    } catch {
      success = false;
    }

    if (!success) {
      success = copyTextFallback(generatedPrompt, promptTextareaRef);
    }

    if (success) {
      setCopied(true);
      setCopyStatus("copied");
      setTimeout(() => {
        setCopied(false);
        setCopyStatus("idle");
      }, 1400);
    } else {
      setCopied(false);
      setCopyStatus("selected");
    }
  };

  const resetDefaults = () => {
    setNiche(defaults.niche);
    setAudience(defaults.audience);
    setGoal(defaults.goal);
    setTopic(defaults.topic);
    setScript(defaults.script);
    setTrend(defaults.trend);
    setViews(defaults.views);
    setHook(defaults.hook);
    setHashtags(defaults.hashtags);
    setCopyStatus("idle");
    setCopied(false);
  };

  return (
    <div className="page">
      <main className="container">
        <header className="hero">
          <div className="badge">✨ TikTok Prompt Generator — Vietnamese Pro</div>
          <h1>Tool bấm nút → ra prompt TikTok</h1>
          <p>Chọn loại prompt, điền thông tin cơ bản, sau đó copy prompt để dùng ngay với ChatGPT.</p>
        </header>

        <div className="layout">
          <section className="card">
            <div className="cardHeader">
              <h2>Thông tin đầu vào</h2>
              <button type="button" onClick={resetDefaults} className="secondaryButton">↻ Reset</button>
            </div>

            <label className="label">Chọn loại prompt</label>
            <div className="typeGrid">
              {promptTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={type === item.id ? "typeButton active" : "typeButton"}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>

            <Input label="Niche" value={niche} onChange={setNiche} />
            <Input label="Đối tượng mục tiêu" value={audience} onChange={setAudience} />
            <Input label="Mục tiêu" value={goal} onChange={setGoal} />
            <Input label="Chủ đề / ý tưởng video" value={topic} onChange={setTopic} />

            {type === "script" && (
              <Textarea label="Script hiện tại" value={script} onChange={setScript} placeholder="Dán script của bạn vào đây..." />
            )}

            {type === "trend" && (
              <Textarea label="Mô tả trend" value={trend} onChange={setTrend} placeholder="Ví dụ: trend before/after, trend âm thanh đang viral..." />
            )}

            {type === "fix" && (
              <>
                <Input label="Views hiện tại" value={views} onChange={setViews} />
                <Input label="Hook đã dùng" value={hook} onChange={setHook} />
                <Input label="Hashtag đã dùng" value={hashtags} onChange={setHashtags} />
              </>
            )}
          </section>

          <section className="card">
            <div className="cardHeader responsive">
              <div>
                <h2>Prompt đã tạo</h2>
                <p className="small">Copy prompt này và dán vào ChatGPT.</p>
              </div>
              <button type="button" onClick={copyPrompt} className="primaryButton">
                {copied ? "✓ Đã copy" : "📋 Copy prompt"}
              </button>
            </div>

            {copyStatus === "selected" && (
              <div className="warning">
                Trình duyệt đang chặn copy tự động. Prompt đã được chọn sẵn, hãy nhấn Ctrl/Cmd + C để copy.
              </div>
            )}

            <textarea
              ref={promptTextareaRef}
              value={generatedPrompt}
              readOnly
              className="promptBox"
            />

            <div className="tip">
              <strong>🪄 Cách dùng nhanh</strong>
              <p>Sau khi copy prompt, dán vào ChatGPT. Nếu muốn output tốt hơn, hãy thêm link video, mô tả sản phẩm, hoặc insight khách hàng.</p>
            </div>

            <div className="tests">
              <button type="button" onClick={() => setShowTests((current) => !current)} className="testToggle">
                <span>Self-tests</span>
                <span>{showTests ? "−" : "+"}</span>
              </button>

              {showTests && (
                <div className="testList">
                  {testResults.map((test) => (
                    <div key={test.name} className="testItem">
                      <span>{test.name}</span>
                      <strong className={test.pass ? "pass" : "fail"}>{test.pass ? "PASS" : "FAIL"}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={5} />
    </div>
  );
}
