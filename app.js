/* ============================================
   简历生成器 - 应用逻辑
   ============================================ */

// ---- Mock 数据 ----
const MOCK_DATA = {
  personalInfo: {
    name: '张明远',
    gender: 'male',
    email: 'zhangmy@example.com',
    phone: '138-8888-6666',
    location: '上海市浦东新区',
    summary: '拥有 6 年全栈开发经验的高级工程师，专注于大规模分布式系统架构设计与前端工程化。主导过多个千万级用户产品的技术方案，熟悉 React、Node.js、Go 及云原生技术栈。'
  },
  workExperience: [
    {
      id: 'w1',
      company: '字节跳动',
      position: '高级前端工程师',
      startDate: '2021-03',
      endDate: '至今',
      description: '负责抖音电商核心交易链路的前端架构设计与性能优化。',
      highlights: ['主导微前端架构迁移，页面加载速度提升 40%', '搭建前端监控体系，线上问题发现率提升至 95%', '带领 5 人团队完成大促活动页引擎开发']
    },
    {
      id: 'w2',
      company: '阿里巴巴',
      position: '前端开发工程师',
      startDate: '2018-07',
      endDate: '2021-02',
      description: '参与淘宝商家后台系统的开发与维护。',
      highlights: ['开发可视化搭建平台，降低运营页面上线周期 60%', '优化 Webpack 构建流程，编译时间缩短 50%']
    }
  ],
  education: [
    {
      id: 'e1',
      school: '复旦大学',
      degree: '硕士',
      major: '计算机科学与技术',
      startDate: '2015-09',
      endDate: '2018-06'
    },
    {
      id: 'e2',
      school: '华东师范大学',
      degree: '学士',
      major: '软件工程',
      startDate: '2011-09',
      endDate: '2015-06'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Go', 'Docker', 'Kubernetes', 'MySQL', 'Redis', 'Webpack', 'GraphQL']
};

// ---- 应用状态 ----
let resumeData = JSON.parse(JSON.stringify(MOCK_DATA));
let currentTemplate = 'classic';
let workIdCounter = 10;
let eduIdCounter = 10;

// ---- DOM 元素引用 ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---- 初始化 ----
document.addEventListener('DOMContentLoaded', () => {
  loadFormData();
  renderPreview();
  bindEvents();
});

// ---- 事件绑定 ----
function bindEvents() {
  // 表单卡片折叠
  $$('.form-card__header').forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.dataset.toggle;
      const body = $('#' + targetId);
      body.classList.toggle('hidden');
      header.classList.toggle('collapsed');
    });
  });

  // 模板切换
  $('#btnTemplateClassic').addEventListener('click', () => switchTemplate('classic'));
  $('#btnTemplateModern').addEventListener('click', () => switchTemplate('modern'));

  // 个人信息输入
  ['inputName', 'inputGender', 'inputEmail', 'inputPhone', 'inputLocation', 'inputSummary'].forEach(id => {
    const el = $('#' + id);
    el.addEventListener('input', () => {
      const key = id.replace('input', '');
      const field = key.charAt(0).toLowerCase() + key.slice(1);
      resumeData.personalInfo[field] = el.value;
      renderPreview();
    });
  });

  // 添加工作经历
  $('#btnAddWork').addEventListener('click', addWorkEntry);

  // 添加教育背景
  $('#btnAddEducation').addEventListener('click', addEducationEntry);

  // 技能添加
  $('#btnAddSkill').addEventListener('click', addSkill);
  $('#inputSkill').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  });

  // 预览按钮
  $('#btnPreview').addEventListener('click', openFullPreview);
  $('#btnClosePreview').addEventListener('click', closeFullPreview);

  // 下载 PDF
  $('#btnDownload').addEventListener('click', downloadPdf);

  // 拖拽分隔条
  initResizeHandle();
}

// ---- 加载表单数据 ----
function loadFormData() {
  const p = resumeData.personalInfo;
  $('#inputName').value = p.name;
  $('#inputGender').value = p.gender;
  $('#inputEmail').value = p.email;
  $('#inputPhone').value = p.phone;
  $('#inputLocation').value = p.location;
  $('#inputSummary').value = p.summary;

  renderWorkList();
  renderEducationList();
  renderSkillTags();
}

// ---- 工作经历 ----
function renderWorkList() {
  const container = $('#workList');
  container.innerHTML = '';
  resumeData.workExperience.forEach((work, idx) => {
    const div = document.createElement('div');
    div.className = 'work-entry';
    div.innerHTML = `
      <div class="entry-header">
        <span>经历 #${idx + 1}</span>
        <button class="btn btn--danger" onclick="removeWork('${work.id}')">删除</button>
      </div>
      <div class="form-row form-row--2col">
        <div class="form-group">
          <label>公司</label>
          <input type="text" value="${esc(work.company)}" data-id="${work.id}" data-field="company" onchange="updateWork(this)" />
        </div>
        <div class="form-group">
          <label>职位</label>
          <input type="text" value="${esc(work.position)}" data-id="${work.id}" data-field="position" onchange="updateWork(this)" />
        </div>
      </div>
      <div class="form-row form-row--2col">
        <div class="form-group">
          <label>开始时间</label>
          <input type="text" value="${esc(work.startDate)}" data-id="${work.id}" data-field="startDate" onchange="updateWork(this)" placeholder="2020-01" />
        </div>
        <div class="form-group">
          <label>结束时间</label>
          <input type="text" value="${esc(work.endDate)}" data-id="${work.id}" data-field="endDate" onchange="updateWork(this)" placeholder="至今" />
        </div>
      </div>
      <div class="form-group">
        <label>工作描述</label>
        <textarea data-id="${work.id}" data-field="description" onchange="updateWork(this)" rows="2">${esc(work.description)}</textarea>
      </div>
      <div class="form-group">
        <label>工作亮点（每行一条）</label>
        <textarea data-id="${work.id}" data-field="highlights" onchange="updateWorkHighlights(this)" rows="3">${work.highlights.join('\n')}</textarea>
      </div>
    `;
    container.appendChild(div);
  });
}

function addWorkEntry() {
  const id = 'w' + (++workIdCounter);
  resumeData.workExperience.push({
    id, company: '', position: '', startDate: '', endDate: '', description: '', highlights: []
  });
  renderWorkList();
  renderPreview();
}

function removeWork(id) {
  resumeData.workExperience = resumeData.workExperience.filter(w => w.id !== id);
  renderWorkList();
  renderPreview();
}

function updateWork(el) {
  const work = resumeData.workExperience.find(w => w.id === el.dataset.id);
  if (work) {
    work[el.dataset.field] = el.value;
    renderPreview();
  }
}

function updateWorkHighlights(el) {
  const work = resumeData.workExperience.find(w => w.id === el.dataset.id);
  if (work) {
    work.highlights = el.value.split('\n').filter(h => h.trim());
    renderPreview();
  }
}

// ---- 教育背景 ----
function renderEducationList() {
  const container = $('#educationList');
  container.innerHTML = '';
  resumeData.education.forEach((edu, idx) => {
    const div = document.createElement('div');
    div.className = 'edu-entry';
    div.innerHTML = `
      <div class="entry-header">
        <span>学历 #${idx + 1}</span>
        <button class="btn btn--danger" onclick="removeEducation('${edu.id}')">删除</button>
      </div>
      <div class="form-row form-row--2col">
        <div class="form-group">
          <label>学校</label>
          <input type="text" value="${esc(edu.school)}" data-id="${edu.id}" data-field="school" onchange="updateEdu(this)" />
        </div>
        <div class="form-group">
          <label>专业</label>
          <input type="text" value="${esc(edu.major)}" data-id="${edu.id}" data-field="major" onchange="updateEdu(this)" />
        </div>
      </div>
      <div class="form-row form-row--2col">
        <div class="form-group">
          <label>学位</label>
          <select data-id="${edu.id}" data-field="degree" onchange="updateEdu(this)">
            <option value="学士" ${edu.degree === '学士' ? 'selected' : ''}>学士</option>
            <option value="硕士" ${edu.degree === '硕士' ? 'selected' : ''}>硕士</option>
            <option value="博士" ${edu.degree === '博士' ? 'selected' : ''}>博士</option>
            <option value="大专" ${edu.degree === '大专' ? 'selected' : ''}>大专</option>
          </select>
        </div>
        <div class="form-group">
          <label>时间</label>
          <input type="text" value="${esc(edu.startDate)} - ${esc(edu.endDate)}" data-id="${edu.id}" data-field="dates" onchange="updateEduDates(this)" placeholder="2015-09 - 2019-06" />
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function addEducationEntry() {
  const id = 'e' + (++eduIdCounter);
  resumeData.education.push({ id, school: '', degree: '学士', major: '', startDate: '', endDate: '' });
  renderEducationList();
  renderPreview();
}

function removeEducation(id) {
  resumeData.education = resumeData.education.filter(e => e.id !== id);
  renderEducationList();
  renderPreview();
}

function updateEdu(el) {
  const edu = resumeData.education.find(e => e.id === el.dataset.id);
  if (edu) { edu[el.dataset.field] = el.value; renderPreview(); }
}

function updateEduDates(el) {
  const edu = resumeData.education.find(e => e.id === el.dataset.id);
  if (edu) {
    const parts = el.value.split('-').map(s => s.trim());
    if (parts.length >= 2) {
      edu.startDate = parts.slice(0, -1).join('-').trim();
      edu.endDate = parts[parts.length - 1].trim();
    }
    renderPreview();
  }
}

// ---- 技能标签 ----
function renderSkillTags() {
  const container = $('#skillsTags');
  container.innerHTML = '';
  resumeData.skills.forEach(skill => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `${esc(skill)} <button onclick="removeSkill('${esc(skill)}')">&times;</button>`;
    container.appendChild(tag);
  });
}

function addSkill() {
  const input = $('#inputSkill');
  const val = input.value.trim();
  if (val && !resumeData.skills.includes(val)) {
    resumeData.skills.push(val);
    renderSkillTags();
    renderPreview();
  }
  input.value = '';
  input.focus();
}

function removeSkill(skill) {
  resumeData.skills = resumeData.skills.filter(s => s !== skill);
  renderSkillTags();
  renderPreview();
}

// ---- 模板切换 ----
function switchTemplate(tpl) {
  currentTemplate = tpl;
  $$('.template-btn').forEach(btn => btn.classList.remove('active'));
  $(`[data-template="${tpl}"]`).classList.add('active');
  renderPreview();
}

// ---- 简历渲染 ----
function renderPreview() {
  const html = currentTemplate === 'classic' ? renderClassic() : renderModern();
  $('#resumePreview').innerHTML = html;
}

function renderClassic() {
  const p = resumeData.personalInfo;
  const contactIcon = (d) => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

  const emailIcon = contactIcon('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>');
  const phoneIcon = contactIcon('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>');
  const locIcon = contactIcon('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>');

  const genderText = p.gender === 'male' ? '男' : p.gender === 'female' ? '女' : '其他';

  return `<div class="resume-classic">
    <div class="sidebar">
      <div>
        <h1>${esc(p.name)}</h1>
        <div class="subtitle" style="margin-top:4px">${genderText}</div>
      </div>
      <div>
        <div class="section-title">联系方式</div>
        ${p.email ? `<div class="contact-item">${emailIcon} ${esc(p.email)}</div>` : ''}
        ${p.phone ? `<div class="contact-item">${phoneIcon} ${esc(p.phone)}</div>` : ''}
        ${p.location ? `<div class="contact-item">${locIcon} ${esc(p.location)}</div>` : ''}
      </div>
      ${resumeData.skills.length ? `
      <div>
        <div class="section-title">专业技能</div>
        <div>${resumeData.skills.map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}</div>
      </div>` : ''}
      ${resumeData.education.length ? `
      <div>
        <div class="section-title">教育背景</div>
        ${resumeData.education.map(e => `
          <div style="margin-bottom:8px">
            <div style="font-size:11px;font-weight:600">${esc(e.school)}</div>
            <div style="font-size:9.5px;opacity:0.8">${esc(e.degree)} · ${esc(e.major)}</div>
            <div style="font-size:9px;opacity:0.6">${esc(e.startDate)} - ${esc(e.endDate)}</div>
          </div>
        `).join('')}
      </div>` : ''}
    </div>
    <div class="main-content">
      ${p.summary ? `
      <div>
        <div class="section-title">个人简介</div>
        <div class="summary-text">${esc(p.summary)}</div>
      </div>` : ''}
      ${resumeData.workExperience.length ? `
      <div>
        <div class="section-title">工作经历</div>
        ${resumeData.workExperience.map(w => `
          <div class="exp-item">
            <div class="exp-header">
              <div>
                <div class="exp-title">${esc(w.position)}</div>
                <div class="exp-company">${esc(w.company)}</div>
              </div>
              <div class="exp-date">${esc(w.startDate)} - ${esc(w.endDate)}</div>
            </div>
            ${w.description ? `<div class="exp-desc">${esc(w.description)}</div>` : ''}
            ${w.highlights.length ? `<ul class="exp-highlights">${w.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
          </div>
        `).join('')}
      </div>` : ''}
    </div>
  </div>`;
}

function renderModern() {
  const p = resumeData.personalInfo;
  const genderText = p.gender === 'male' ? '男' : p.gender === 'female' ? '女' : '其他';

  return `<div class="resume-modern">
    <div class="mod-header">
      <h1>${esc(p.name)}</h1>
      <div class="mod-contacts">
        <span>${genderText}</span>
        ${p.email ? `<span>✉ ${esc(p.email)}</span>` : ''}
        ${p.phone ? `<span>☎ ${esc(p.phone)}</span>` : ''}
        ${p.location ? `<span>⊕ ${esc(p.location)}</span>` : ''}
      </div>
    </div>
    ${p.summary ? `
    <div class="mod-section">
      <div class="mod-section-title">个人简介</div>
      <div class="mod-summary">${esc(p.summary)}</div>
    </div>` : ''}
    ${resumeData.workExperience.length ? `
    <div class="mod-section">
      <div class="mod-section-title">工作经历</div>
      ${resumeData.workExperience.map(w => `
        <div class="mod-exp">
          <div class="mod-exp-header">
            <span class="mod-exp-title">${esc(w.position)}</span>
            <span class="mod-exp-date">${esc(w.startDate)} - ${esc(w.endDate)}</span>
          </div>
          <div class="mod-exp-company">${esc(w.company)}</div>
          ${w.description ? `<div class="mod-exp-desc">${esc(w.description)}</div>` : ''}
          ${w.highlights.length ? `<ul class="mod-exp-highlights">${w.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        </div>
      `).join('')}
    </div>` : ''}
    ${resumeData.education.length ? `
    <div class="mod-section">
      <div class="mod-section-title">教育背景</div>
      ${resumeData.education.map(e => `
        <div class="mod-edu">
          <div class="mod-edu-row">
            <span class="mod-edu-school">${esc(e.school)}</span>
            <span class="mod-edu-date">${esc(e.startDate)} - ${esc(e.endDate)}</span>
          </div>
          <div class="mod-edu-detail">${esc(e.degree)} · ${esc(e.major)}</div>
        </div>
      `).join('')}
    </div>` : ''}
    ${resumeData.skills.length ? `
    <div class="mod-section">
      <div class="mod-section-title">专业技能</div>
      <div class="mod-skills">${resumeData.skills.map(s => `<span class="mod-skill-tag">${esc(s)}</span>`).join('')}</div>
    </div>` : ''}
  </div>`;
}

// ---- 全屏预览 ----
function openFullPreview() {
  const overlay = $('#previewOverlay');
  const html = currentTemplate === 'classic' ? renderClassic() : renderModern();
  $('#resumePreviewFull').innerHTML = html;
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeFullPreview() {
  $('#previewOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

// ---- PDF 下载 ----
async function downloadPdf() {
  showToast('正在生成 PDF...');

  const preview = $('#resumePreview');

  try {
    const canvas = await html2canvas(preview, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/png');

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    const fileName = `${resumeData.personalInfo.name || '简历'}_resume.pdf`;
    pdf.save(fileName);
    showToast('PDF 下载成功！');
  } catch (err) {
    console.error('PDF generation failed:', err);
    showToast('PDF 生成失败，请重试');
  }
}

// ---- Toast 提示 ----
function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- 工具函数 ----
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- 拖拽分隔条 ----
function initResizeHandle() {
  const handle = $('#resizeHandle');
  const editor = $('#editorPanel');
  const mainLayout = $('#mainLayout');

  if (!handle || !editor) return;

  const MIN_WIDTH = 300;
  const MAX_WIDTH_RATIO = 0.65; // 最大占主区域宽度的 65%
  const DEFAULT_WIDTH = 460;

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  function onPointerDown(e) {
    // 仅响应宽屏（非响应式布局）
    if (window.innerWidth <= 960) return;

    isDragging = true;
    startX = e.clientX || e.touches?.[0]?.clientX || 0;
    startWidth = editor.getBoundingClientRect().width;

    handle.classList.add('dragging');
    document.body.classList.add('resizing');

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const delta = clientX - startX;
    const maxWidth = mainLayout.getBoundingClientRect().width * MAX_WIDTH_RATIO;
    const newWidth = Math.min(Math.max(startWidth + delta, MIN_WIDTH), maxWidth);

    editor.style.width = newWidth + 'px';
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;

    handle.classList.remove('dragging');
    document.body.classList.remove('resizing');
  }

  // 鼠标事件
  handle.addEventListener('mousedown', onPointerDown);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);

  // 触摸事件
  handle.addEventListener('touchstart', onPointerDown, { passive: false });
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchend', onPointerUp);

  // 双击恢复默认宽度
  handle.addEventListener('dblclick', () => {
    editor.style.width = DEFAULT_WIDTH + 'px';
  });
}
