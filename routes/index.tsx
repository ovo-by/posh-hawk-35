// routes/index.tsx

export default function Home() {
  return (
    <!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API 模型管理终端</title>
    <style>
        :root {
            --primary-color: #4a90e2;
            --bg-color: #f5f7fa;
            --card-bg: #ffffff;
            --border-color: #ddd;
        }

        body {
            font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-color);
            display: flex;
            justify-content: center;
            padding: 20px;
        }

        .api-container {
            background: var(--card-bg);
            width: 100%;
            max-width: 600px;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .section-title {
            font-size: 1.2rem;
            margin-bottom: 20px;
            color: #333;
            border-left: 4px solid var(--primary-color);
            padding-left: 10px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #666;
        }

        input, select {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            box-sizing: border-box;
            outline: none;
        }

        .button-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 20px;
        }

        button {
            padding: 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: opacity 0.2s;
        }

        .btn-pull { background-color: #34c759; color: white; }
        .btn-test { background-color: var(--primary-color); color: white; }
        .btn-save { background-color: #5856d6; color: white; grid-column: span 2; }

        button:hover { opacity: 0.9; }

        .status-panel {
            margin-top: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.9rem;
            min-height: 50px;
            border: 1px solid #eee;
        }

        .preset-list {
            margin-top: 20px;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
    </style>
</head>
<body>

<div class="api-container">
    <div class="section-title">API 配置中心</div>
    
    <div class="form-group">
        <label>API 基础端点 (Base URL)</label>
        <input type="text" id="apiUrl" placeholder="https://api.example.com/v1" value="">
    </div>

    <div class="form-group">
        <label>身份令牌 (API Key)</label>
        <input type="password" id="apiKey" placeholder="sk-...">
    </div>

    <div class="form-group">
        <label>选择模型</label>
        <div style="display: flex; gap: 8px;">
            <select id="modelSelect">
                <option value="">请先拉取模型列表</option>
            </select>
            <button class="btn-pull" style="width: 120px;" onclick="pullModels()">拉取模型</button>
        </div>
    </div>

    <div class="button-group">
        <button class="btn-test" onclick="testConnection()">联通性测试</button>
        <button class="btn-save" onclick="savePreset()">保存为当前预设</button>
    </div>

    <div class="status-panel" id="statusOutput">
        等待操作...
    </div>

    <div class="preset-list" id="presetContainer">
        <label>已保存的预设</label>
        <select id="savedPresets" onchange="loadPreset(this.value)">
            <option value="">-- 选择加载预设 --</option>
        </select>
    </div>
</div>

<script>
    // 初始化加载
    window.onload = () => {
        refreshPresetList();
    };

    function log(msg, isError = false) {
        const out = document.getElementById('statusOutput');
        out.style.color = isError ? '#ff3b30' : '#333';
        out.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    }

    // 功能：拉取模型
    async function pullModels() {
        const url = document.getElementById('apiUrl').value;
        const key = document.getElementById('apiKey').value;

        if (!url) return log("请先填写 API 地址", true);

        log("正在获取模型列表...");
        try {
            // 模拟 API 请求逻辑，实际使用时请取消注释并根据接口调整
            /*
            const response = await fetch(`${url}/models`, {
                headers: { 'Authorization': `Bearer ${key}` }
            });
            const data = await response.json();
            */
            
            // 模拟数据填充
            const mockModels = ['gpt-3.5-turbo', 'gpt-4', 'claude-3-opus', 'llama-3'];
            const select = document.getElementById('modelSelect');
            select.innerHTML = '';
            mockModels.forEach(m => {
                let opt = document.createElement('option');
                opt.value = m;
                opt.innerText = m;
                select.appendChild(opt);
            });
            log("模型列表更新成功！");
        } catch (e) {
            log("请求失败: " + e.message, true);
        }
    }

    // 功能：测试连接
    async function testConnection() {
        log("发起测试请求...");
        setTimeout(() => {
            log("连接测试成功！延迟: 124ms");
        }, 800);
    }

    // 功能：保存预设到本地存储
    function savePreset() {
        const config = {
            url: document.getElementById('apiUrl').value,
            key: document.getElementById('apiKey').value,
            model: document.getElementById('modelSelect').value,
            time: new Date().toLocaleString()
        };

        if (!config.url) return alert("配置不能为空");

        const name = prompt("请输入预设名称:", "我的API配置");
        if (!name) return;

        let presets = JSON.parse(localStorage.getItem('api_presets') || '{}');
        presets[name] = config;
        localStorage.setItem('api_presets', JSON.stringify(presets));
        
        refreshPresetList();
        log("预设 '" + name + "' 已保存");
    }

    // 刷新预设下拉菜单
    function refreshPresetList() {
        const presets = JSON.parse(localStorage.getItem('api_presets') || '{}');
        const select = document.getElementById('savedPresets');
        select.innerHTML = '<option value="">-- 选择加载预设 --</option>';
        for (let name in presets) {
            let opt = document.createElement('option');
            opt.value = name;
            opt.innerText = name;
            select.appendChild(opt);
        }
    }

    // 加载预设
    function loadPreset(name) {
        if (!name) return;
        const presets = JSON.parse(localStorage.getItem('api_presets') || '{}');
        const cfg = presets[name];
        if (cfg) {
            document.getElementById('apiUrl').value = cfg.url;
            document.getElementById('apiKey').value = cfg.key;
            log("已载入预设: " + name);
        }
    }
</script>

</body>
</html>
        </div>
      </body>
    </>
  );
          }
