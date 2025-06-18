常数 双子座_API_KEY = " aiza saur 5 x 1 bsxlc 6 R4 ectqqsmavpzsl 0 WP 20 c ";

常数 GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

德诺.服务(异步ˌ非同步(asynchronous) (请求) => {
  如果 (请求.方法 !== 《邮报》) {
    返回 新的 反应("仅支持POST ", { 状态: 405 });
  }

  常数 身体 = 等待 请求.json();
  常数 用户消息 = 身体?.信息?.发现((m) => m.作用 === "用户")?.内容;

  如果 (!用户消息 || !双子座_API_KEY) {
    返回 新的 反应("缺少消息或API密钥", { 状态: 400 });
  }

  常数 双子座 = {
    内容: [
      {
        作用: "用户",
        部件: [{ 文本: 用户消息 }],
      },
    ],
  };

  常数 表示留数 = 等待 取得(`${GEMINI_API_URL}？密钥=${双子座_API_KEY}`, {
    方法: 《邮报》,
    头球: {
      "内容类型": "应用程序/json ",
    },
    身体: JSON.字符串化(双子座),
  });

  常数 双生数据 = 等待 表示留数.json();
  常数 文本 = 双生数据?.候选人?.[0]?.内容?.部件?.[0]?.文本 || "(没有回应)";

  返回 反应.json({
    身份证明（identification）(识别): “双子代理”,
    目标: "聊天.完成",
    选择: [
      {
        消息: {
          作用: “助理”,
          内容: 文本,
        },
      },
    ],
  });
});
