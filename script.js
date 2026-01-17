/* script.js */
new Vue({
    el: '#app',
    data: {
        // === 基础数据 ===
        currentTime: '', currentTimeOnly: '', currentDate: '', batteryLevel: 88, activePageIndex: 0, startX: 0,
        currentApp: null, currentAppName: '',
        
        page1Items: [{ id: 'camera', type: 'app', name: '相机', icon: 'fas fa-camera' }, { id: 'photos', type: 'app', name: '相册', icon: 'fas fa-images' }, { id: 'chat', type: 'app', name: 'AI 聊天', icon: 'fas fa-comments' }, { id: 'api', type: 'app', name: 'API设置', icon: 'fas fa-sliders-h' }, { id: 'widget1', type: 'widget', shape: 'shape-square', image: '' }, { id: 'widget2', type: 'widget', shape: 'shape-heart', image: '' }],
        page2Items: [{ id: 'maps', type: 'app', name: '地图', icon: 'fas fa-map-marked-alt' }, { id: 'weather', type: 'app', name: '天气', icon: 'fas fa-cloud-sun' }, { id: 'clock', type: 'app', name: '时钟', icon: 'fas fa-clock' }, { id: 'calendar', type: 'app', name: '日历', icon: 'fas fa-calendar-alt' }, { id: 'music', type: 'app', name: '音乐', icon: 'fas fa-music' }, { id: 'notes', type: 'app', name: '备忘录', icon: 'fas fa-sticky-note' }],
        page3Items: [{ id: 'store', type: 'app', name: '商店', icon: 'fas fa-store' }, { id: 'calc', type: 'app', name: '计算器', icon: 'fas fa-calculator' }],
        dockApps: [{ id: 'phone', name: '电话', icon: 'fas fa-phone' }, { id: 'message', name: '短信', icon: 'fas fa-comment' }, { id: 'browser', name: '浏览器', icon: 'fas fa-globe' }, { id: 'settings', name: '设置', icon: 'fas fa-cog' }],
        tempUploadTarget: null,

        apiState: { url: 'https://api.openai.com/v1', key: '', selectedModel: '', models: [], log: '', presets: {}, currentPresetName: '' },

        chatView: 'list', chatTab: 'msg',
        // 增加 userPersona 字段，用于存储"我在该角色眼里的身份"
        characters: [{ id: 1, name: 'AI 助手', group: '系统', avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', remark: '默认智能助手', prompt: '你是一个乐于助人的AI助手，请用简短的句子回答。', userPersona: '' }],
        activeCharId: null, activeCharName: '', activeMessages: [], inputMessage: '', isAiTyping: false,
        tempCharForm: { name: '', remark: '', group: '', prompt: '', avatar: '', userPersona: '' },

        myProfile: { name: '我', avatar: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png', bg: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
        momentsList: [],
        isRefreshingMoments: false,
        commentingMomentIndex: null, commentReplyTarget: null, commentPlaceholder: '评论...', commentDraft: '',
        
        showHistory: false, historyLogs: [],
        showRefreshModal: false, showPostModal: false,
        showChatMorePanel: false // 新增：聊天室底部面板状态
    },
    mounted() {
        this.updateTime(); setInterval(this.updateTime, 1000);
        this.loadApiConfig(); this.loadPresets();
    },
    methods: {
        updateTime() { const now = new Date(); this.currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); this.currentTimeOnly = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); this.currentDate = now.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }); },
        handleTouchStart(e) { this.startX = e.changedTouches[0].clientX; },
        handleTouchEnd(e) { const diff = this.startX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { if (diff > 0 && this.activePageIndex < 2) this.activePageIndex++; else if (diff < 0 && this.activePageIndex > 0) this.activePageIndex--; } },
        openApp(id, name) { this.currentApp = id; this.currentAppName = name; if (id === 'chat') this.chatView = 'list'; },
        closeApp() { this.currentApp = null; this.currentAppName = ''; },
        getCurrentAppIcon() { return 'fas fa-cube'; },
        triggerUpload(item) { this.tempUploadTarget = item; this.$refs.fileInput.click(); },
        handleImageUpload(e) { const f = e.target.files[0]; if (f && this.tempUploadTarget) { const r = new FileReader(); r.onload = (ev) => { this.tempUploadTarget.image = ev.target.result; this.tempUploadTarget = null; }; r.readAsDataURL(f); } },
        
        log(msg) { console.log(msg); },
        saveApiConfig() { localStorage.setItem('minimal_api_config', JSON.stringify({ url: this.apiState.url, key: this.apiState.key, selectedModel: this.apiState.selectedModel })); },
        loadApiConfig() { const s = localStorage.getItem('minimal_api_config'); if (s) { const c = JSON.parse(s); this.apiState.url = c.url || 'https://api.openai.com/v1'; this.apiState.key = c.key || ''; this.apiState.selectedModel = c.selectedModel || ''; } },
        loadPresets() { try { this.apiState.presets = JSON.parse(localStorage.getItem('minimal_api_presets')) || {}; } catch(e){} },
        saveNewPreset() { const n = prompt("预设名称："); if(n){ this.$set(this.apiState.presets, n, { url: this.apiState.url, key: this.apiState.key, selectedModel: this.apiState.selectedModel }); localStorage.setItem('minimal_api_presets', JSON.stringify(this.apiState.presets)); this.apiState.currentPresetName = n; } },
        loadPreset() { const c = this.apiState.presets[this.apiState.currentPresetName]; if(c){ this.apiState.url=c.url; this.apiState.key=c.key; this.apiState.selectedModel=c.selectedModel; this.saveApiConfig(); } },
        deletePreset() { if(this.apiState.currentPresetName && confirm("删除?")){ this.$delete(this.apiState.presets, this.apiState.currentPresetName); localStorage.setItem('minimal_api_presets', JSON.stringify(this.apiState.presets)); this.apiState.currentPresetName=''; } },
        async fetchRemoteModels() { if (!this.apiState.key) return alert("NO KEY"); let u = this.apiState.url.replace(/\/+$/, ''); try { const r = await fetch(`${u}/models`, { headers: { 'Authorization': `Bearer ${this.apiState.key}` } }); const d = await r.json(); if(d.data) { this.apiState.models = d.data; if(d.data.length) this.apiState.selectedModel = d.data[0].id; this.saveApiConfig(); } } catch(e){ alert(e.message); } },

        onImgError(e) { e.target.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png'; },
        
        // === 角色管理 (新增/编辑) ===
        openCreateChar() { this.tempCharForm = { name: '', remark: '', group: '', prompt: '', avatar: '', userPersona: '' }; this.chatView = 'create'; },
        
        // 修改角色：读取当前角色信息到表单
        editActiveChar() { 
            const c = this.characters.find(x => x.id === this.activeCharId);
            if(c) {
                // 深拷贝防止直接修改
                this.tempCharForm = JSON.parse(JSON.stringify(c));
                this.chatView = 'edit';
            }
        },
        
        // 保存角色 (兼容新建和修改)
        saveCharacter() { 
            if (!this.tempCharForm.name) return alert('输入名字');
            
            if (this.chatView === 'edit') {
                // 修改现有
                const idx = this.characters.findIndex(c => c.id === this.activeCharId);
                if (idx !== -1) {
                    // 保持ID不变，更新其他字段
                    this.characters.splice(idx, 1, { ...this.tempCharForm, id: this.activeCharId });
                    this.activeCharName = this.tempCharForm.name; // 更新当前聊天标题
                }
            } else {
                // 新建
                const newId = Date.now();
                this.characters.push({ ...this.tempCharForm, id: newId });
            }
            this.chatView = 'list'; 
        },

        enterChat(id) { 
            const c = this.characters.find(x => x.id === id); 
            if(c){ 
                this.activeCharId = c.id; 
                this.activeCharName = c.name; 
                this.chatView = 'room'; 
                this.showChatMorePanel = false; // 重置面板
                if(!this.activeMessages.length) this.activeMessages=[{ role:'assistant', content:`你好，我是${c.name}` }]; 
            } 
        },
        goBackToChatListOrChat() { 
            if (this.chatView === 'edit') this.chatView = 'room'; // 如果是编辑状态，返回聊天室
            else this.chatView = 'list'; 
            this.showChatMorePanel = false;
        },
        sendUserMessage() { if(!this.inputMessage.trim()) return; this.activeMessages.push({ role:'user', content:this.inputMessage }); this.inputMessage=''; this.scrollToBottom(); },
        
        // === 新增：聊天室底部面板逻辑 ===
        toggleChatMorePanel() {
            this.showChatMorePanel = !this.showChatMorePanel;
            this.scrollToBottom();
        },
        handleChatAction(action) {
            if (action === 'photo' || action === 'camera') {
                this.$refs.chatImageInput.click();
            } else {
                // 模拟其他动作，暂用文本占位，不使用 alert 阻断体验
                const actionMap = { 'video': '视频通话', 'location': '位置', 'redpacket': '红包', 'transfer': '转账', 'voice': '语音输入', 'file': '文件' };
                this.activeMessages.push({ role: 'user', content: `[${actionMap[action] || action}]` });
                this.scrollToBottom();
                this.showChatMorePanel = false;
            }
        },
        handleChatImageUpload(e) {
             const f = e.target.files[0];
             if(f) {
                 const r = new FileReader();
                 r.onload = (ev) => {
                     // 简单处理：发送图片文字标识（未来可扩展为图片消息）
                     this.activeMessages.push({ role: 'user', content: '[图片]' }); 
                     this.scrollToBottom();
                     this.showChatMorePanel = false;
                 };
                 r.readAsDataURL(f);
             }
        },

        // === AI 聊天回复 (聊天室) ===
        async triggerAiReply() {
            if(this.isAiTyping) return; this.isAiTyping = true; this.scrollToBottom();
            const char = this.characters.find(c => c.id === this.activeCharId);
            if(!this.apiState.key){ this.isAiTyping=false; this.activeMessages.push({ role:'assistant', content:'API未配置' }); return; }
            try {
                let u = this.apiState.url.replace(/\/+$/, '');
                
                // 构建 System Prompt：注入用户设定的 User Persona
                let systemContent = char.prompt;
                if (char.userPersona) {
                    systemContent += `\n\n[Relationship/Context]: The user says: "${char.userPersona}". You MUST keep this relationship in mind when replying.`;
                }

                const r = await fetch(`${u}/chat/completions`, { 
                    method:'POST', 
                    headers: { 'Authorization': `Bearer ${this.apiState.key}`, 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ 
                        model: this.apiState.selectedModel, 
                        messages: [ 
                            { role:"system", content: systemContent }, 
                            ...this.activeMessages.slice(-10).map(m=>({role:m.role, content:m.content})) 
                        ] 
                    }) 
                });
                const d = await r.json(); this.isAiTyping = false;
                if(d.choices){ const t = d.choices[0].message.content; this.activeMessages.push({ role:'assistant', content: t }); this.scrollToBottom(); }
            } catch(e){ this.isAiTyping=false; this.activeMessages.push({ role:'assistant', content:e.message }); }
        },
        scrollToBottom() { this.$nextTick(() => { const c = this.$refs.msgContainer; if(c) c.scrollTop = c.scrollHeight; }); },
        getCharAvatar(id) { const c = this.characters.find(x => x.id === id); return c ? (c.avatar || 'assets/default-avatar.png') : ''; },
        triggerCharAvatarUpload() { this.$refs.charFileInput.click(); },
        handleCharImageUpload(e) { const f = e.target.files[0]; if(f){ const r=new FileReader(); r.onload=(ev)=>this.tempCharForm.avatar=ev.target.result; r.readAsDataURL(f); } },

        // === 朋友圈业务逻辑 ===
        editMyName() { const n = prompt("修改昵称", this.myProfile.name); if(n) this.myProfile.name = n; },
        triggerBgUpload() { this.$refs.bgInput.click(); },
        triggerMyAvatarUpload() { this.$refs.myAvatarInput.click(); },
        handleBgUpload(e) { const f = e.target.files[0]; if(f){ const r=new FileReader(); r.onload=(ev)=>this.myProfile.bg=ev.target.result; r.readAsDataURL(f); } },
        handleMyAvatarUpload(e) { const f = e.target.files[0]; if(f){ const r=new FileReader(); r.onload=(ev)=>this.myProfile.avatar=ev.target.result; r.readAsDataURL(f); } },

        // 1. 点击刷新按钮 - 弹窗
        clickRefreshBtn() { this.showRefreshModal = true; },

        // 2. 确认刷新 (分流逻辑)
        async confirmRefresh(type) {
            this.showRefreshModal = false;
            if (!this.apiState.key) return alert("请先配置 API Key");
            if (this.characters.length === 0) return alert("请先创建角色");

            this.isRefreshingMoments = true;
            
            if (type === 'feed') {
                // A. 刷新角色朋友圈 + B. 刷新对我评论的回复 (升级版：连续对话)
                const p1 = this.refreshCharacterFeeds();
                const p2 = this.refreshRepliesToMe();
                await Promise.all([p1, p2]);
            } else if (type === 'interaction') {
                // C. 刷新对我(User)动态的点赞评论
                await this.refreshInteractionsOnMe();
            }
            
            this.isRefreshingMoments = false;
        },

        // A. 生成角色动态
        async refreshCharacterFeeds() {
            const promises = this.characters.map(async (char) => {
                try {
                    let u = this.apiState.url.replace(/\/+$/, '');
                    const r = await fetch(`${u}/chat/completions`, {
                        method: 'POST', headers: { 'Authorization': `Bearer ${this.apiState.key}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            model: this.apiState.selectedModel, 
                            messages: [
                                { role: "system", content: `You are ${char.name}. ${char.prompt}\n\nIMPORTANT: You are NOT an AI assistant. You are a real person posting on social media (Moments). Speak casually, naturally.` }, 
                                { role: "user", content: "Post a new status update. Just the text, no quotes." }
                            ], 
                            temperature: 0.9, max_tokens: 300 
                        })
                    });
                    const d = await r.json();
                    if (d.choices) return { id: Date.now()+Math.random(), name: char.name, avatar: char.avatar, content: d.choices[0].message.content.trim(), time: '刚刚', showMenu: false, likes: [], comments: [], type: 'text' };
                } catch (e) {} return null;
            });
            const res = await Promise.all(promises);
            this.momentsList = [...res.filter(m => m), ...this.momentsList];
        },

        // B. 生成互动：角色回复我的评论 (增强版：支持所有帖子下的对话延续)
        async refreshRepliesToMe() {
            const candidates = [];

            this.momentsList.forEach(post => {
                if (post.comments.length > 0) {
                    const lastComment = post.comments[post.comments.length - 1];
                    
                    // 只有最后一条是"我"发的，才需要角色回复
                    if (lastComment.user === this.myProfile.name) {
                        let targetCharName = null;

                        // 情况1: 角色发的帖子 -> 默认回复贴主(角色)
                        if (post.name !== this.myProfile.name) {
                            targetCharName = post.name;
                        } 
                        // 情况2: 我发的帖子 -> 看看我回复了谁
                        else {
                            if (lastComment.replyTo) {
                                targetCharName = lastComment.replyTo;
                            } else if (post.comments.length >= 2) {
                                // 如果没指定回复谁，但上面还有评论，默认认为是回复倒数第二条评论的人
                                const prevComment = post.comments[post.comments.length - 2];
                                targetCharName = prevComment.user;
                            }
                        }

                        // 确认目标是有效的角色
                        if (targetCharName && this.characters.find(c => c.name === targetCharName)) {
                            candidates.push({ post, targetCharName });
                        }
                    }
                }
            });

            if (candidates.length === 0) return;

            // 并发限制，防止一次回复太多
            const targets = candidates.slice(0, 3);
            
            const promises = targets.map(async ({ post, targetCharName }) => {
                const char = this.characters.find(c => c.name === targetCharName);
                if (!char) return;
                
                try {
                    let u = this.apiState.url.replace(/\/+$/, '');
                    
                    // 构建上下文：帖子内容 + 最近几条评论
                    const postContent = post.type === 'text' ? post.content : `[发布了${post.type}] ${post.content || ''}`;
                    
                    // 取最近 5 条评论作为上下文，形成对话流
                    const recentComments = post.comments.slice(-5).map(c => `${c.user}: ${c.text}`).join('\n');
                    
                    // 注入 User Persona
                    const userContext = char.userPersona ? `Your friend's identity/context: ${char.userPersona}` : '';

                    const r = await fetch(`${u}/chat/completions`, {
                        method: 'POST', 
                        headers: { 'Authorization': `Bearer ${this.apiState.key}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: this.apiState.selectedModel,
                            messages: [
                                { role: "system", content: `You are ${char.name}. ${char.prompt}\n${userContext}\n\nIMPORTANT: You are participating in a comment thread on a social media post. Act naturally, be brief, and consistent with the context.` },
                                { role: "user", content: `[Post Content]: "${postContent}"\n\n[Comment Thread]:\n${recentComments}\n\nReply to the last comment by "${this.myProfile.name}". Just output the reply text.` }
                            ]
                        })
                    });
                    const d = await r.json();
                    if (d.choices) {
                        const replyText = d.choices[0].message.content.trim();
                        post.comments.push({
                            user: char.name,
                            text: replyText,
                            replyTo: this.myProfile.name
                        });
                        this.addHistoryLog(char, "回复了你的评论", replyText);
                    }
                } catch(e) { console.error(e); }
            });
            
            await Promise.all(promises);
        },

        // C. 生成互动：点赞或评论我的帖子
        async refreshInteractionsOnMe() {
            const myPosts = this.momentsList.filter(m => m.name === this.myProfile.name);
            if (myPosts.length === 0) { alert("你还没有发过朋友圈哦，大家没法互动~"); return; }

            const chars = [...this.characters].sort(() => 0.5 - Math.random()).slice(0, Math.min(3, this.characters.length));
            
            for (let char of chars) {
                const targetPost = myPosts[Math.floor(Math.random() * myPosts.length)];
                const postContent = targetPost.type === 'text' ? targetPost.content : `[发布了${targetPost.type}] ${targetPost.content || ''}`;
                
                // 注入 User Persona
                const userContext = char.userPersona ? `The user who posted this is: ${char.userPersona}` : '';

                try {
                    let u = this.apiState.url.replace(/\/+$/, '');
                    const r = await fetch(`${u}/chat/completions`, {
                        method: 'POST', headers: { 'Authorization': `Bearer ${this.apiState.key}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: this.apiState.selectedModel,
                            messages: [
                                { role: "system", content: `You are ${char.name}. ${char.prompt}\n${userContext}\n\nIMPORTANT: Roleplay as this character viewing a friend's social media post. Do NOT act like an AI assistant. React naturally based on your persona.` },
                                { role: "user", content: `The user posted: "${postContent}".\nDecide how to react.\n\nOutput ONLY one of these formats:\n- LIKE\n- COMMENT: [Your comment text]\n- BOTH: [Your comment text]` }
                            ]
                        })
                    });
                    const d = await r.json();
                    if (d.choices) {
                        const reply = d.choices[0].message.content.trim();
                        let doLike = false;
                        let commentText = "";

                        if (reply.includes("BOTH:")) {
                            doLike = true; commentText = reply.split("BOTH:")[1].trim();
                        } else if (reply.includes("LIKE")) {
                            doLike = true;
                        } else if (reply.includes("COMMENT:")) {
                            commentText = reply.split("COMMENT:")[1].trim();
                        } else {
                             // 兜底：如果AI没按格式回，只要不长，就当做评论
                            if(reply.length < 50) commentText = reply;
                        }

                        if (doLike) {
                            if (!targetPost.likes.includes(char.name)) {
                                targetPost.likes.push(char.name);
                                this.addHistoryLog(char, "赞了你的朋友圈", targetPost.content || `[${targetPost.type}]`);
                            }
                        }
                        if (commentText) {
                            targetPost.comments.push({ user: char.name, text: commentText });
                            this.addHistoryLog(char, "评论了你", commentText);
                        }
                    }
                } catch (e) { console.error(e); }
            }
        },

        // 添加历史记录
        addHistoryLog(char, action, content) {
            this.historyLogs.unshift({
                name: char.name,
                avatar: char.avatar || 'assets/default-avatar.png',
                action: action,
                content: content,
                time: '刚刚'
            });
        },

        openHistory() { this.showHistory = true; },

        // === 3. 发布动态逻辑 ===
        clickAddBtn() { this.showPostModal = true; },
        handlePostSelect(type) {
            this.showPostModal = false;
            if (type === 'text') {
                const t = prompt("发布文字动态:");
                if(t) this.addMoment('text', t);
            } else if (type === 'file') {
                const t = prompt("输入文件名称/描述:");
                if(t) this.addMoment('file', '', t); // content空, mediaUrl存文件名
            } else if (type === 'image') {
                this.$refs.postImageInput.click();
            } else if (type === 'video') {
                this.$refs.postVideoInput.click();
            }
        },
        
        finishPostImage(e) {
            const f = e.target.files[0];
            if(f) {
                const r = new FileReader();
                r.onload = (ev) => {
                    const txt = prompt("配点文字吗？(可选)");
                    this.addMoment('image', txt || '', ev.target.result);
                };
                r.readAsDataURL(f);
            }
        },
        finishPostVideo(e) {
            const f = e.target.files[0];
            if(f) {
                const r = new FileReader();
                r.onload = (ev) => {
                    const txt = prompt("配点文字吗？(可选)");
                    this.addMoment('video', txt || '', ev.target.result);
                };
                r.readAsDataURL(f);
            }
        },

        addMoment(type, content, mediaUrl = null) {
            this.momentsList.unshift({
                id: Date.now(),
                name: this.myProfile.name,
                avatar: this.myProfile.avatar,
                content: content,
                type: type, // text, image, video, file
                mediaUrl: mediaUrl || content, // 对于file类型，这里存文件名
                time: '刚刚',
                showMenu: false,
                likes: [],
                comments: []
            });
        },
        
        previewImage(url) {
            const w = window.open("");
            w.document.write(`<img src="${url}" style="max-width:100%">`);
        },

        // 通用朋友圈交互
        toggleActionMenu(i) { this.momentsList.forEach((m, idx)=>{ if(i!==idx) m.showMenu=false; }); this.momentsList[i].showMenu = !this.momentsList[i].showMenu; },
        closeAllPopups() { this.momentsList.forEach(m => m.showMenu=false); this.commentingMomentIndex=null; this.commentReplyTarget=null; },
        likeMoment(i) { const m = this.momentsList[i]; if(!m.likes.includes(this.myProfile.name)) m.likes.push(this.myProfile.name); else m.likes = m.likes.filter(n=>n!==this.myProfile.name); m.showMenu=false; },
        openCommentInput(i, r) { this.commentingMomentIndex=i; this.commentReplyTarget=r; this.commentPlaceholder=r?`回复 ${r}:`:'评论...'; this.commentDraft=''; this.momentsList[i].showMenu=false; this.$nextTick(()=>this.$refs.commentInput.focus()); },
        submitComment() { if(this.commentingMomentIndex!==null && this.commentDraft.trim()){ this.momentsList[this.commentingMomentIndex].comments.push({ user: this.myProfile.name, text: this.commentDraft.trim(), replyTo: this.commentReplyTarget }); this.commentingMomentIndex=null; } }
    }
});



