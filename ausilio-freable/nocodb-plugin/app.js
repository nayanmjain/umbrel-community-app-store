const BASE_PATH = window.location.pathname.startsWith('/ai') ? '/ai' : '';
const AI_ENGINE_URL = window.location.origin + BASE_PATH;
const API_BASE = AI_ENGINE_URL + '/api';

let editingProviderId = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
  loadProviders();
  populateProviderSelects();
});

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}/v1${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (options.body) config.body = JSON.stringify(options.body);
  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function loadProviders() {
  const container = document.getElementById('providers-list');
  try {
    const data = await apiCall('/providers');
    const providers = data.providers || [];
    if (providers.length === 0) {
      container.innerHTML = '<div class="empty-state">No AI providers configured yet. Add one to get started.</div>';
      return;
    }
    container.innerHTML = providers.map(p => `
      <div class="provider-card">
        <div class="info">
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.type)} · ${escapeHtml(p.defaultModel)} · ${escapeHtml(p.baseUrl || 'Default URL')} · Key: ${p.apiKey}</p>
        </div>
        <div class="actions">
          <button class="btn btn-danger btn-sm" onclick="deleteProvider('${p.id}')">Delete</button>
        </div>
      </div>
    `).join('');
    populateProviderSelects();
  } catch (err) {
    if (providers.length === 0) {
      container.innerHTML = '<div class="empty-state">⚠️ Cannot connect to AI Engine. Make sure it is running.</div>';
    }
  }
}

async function populateProviderSelects() {
  const selects = ['sf-provider', 'fm-provider', 'cl-provider', 'nlp-provider'];
  try {
    const data = await apiCall('/providers');
    const providers = data.providers || [];
    const options = providers.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.defaultModel)})</option>`).join('');
    const empty = '<option value="">— No providers —</option>';
    selects.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) sel.innerHTML = providers.length ? options : empty;
    });
  } catch {
    selects.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) sel.innerHTML = '<option value="">— Cannot connect to AI Engine —</option>';
    });
  }
}

function showAddProvider() {
  editingProviderId = null;
  document.getElementById('pm-type').value = 'openai-compatible';
  document.getElementById('pm-name').value = '';
  document.getElementById('pm-base-url').value = 'https://api.openai.com/v1';
  document.getElementById('pm-api-key').value = '';
  document.getElementById('pm-model').value = 'gpt-4o';
  document.getElementById('pm-result').className = 'result-area';
  document.getElementById('pm-result').style.display = 'none';
  document.getElementById('provider-modal').classList.add('visible');
}

function closeModal() {
  document.getElementById('provider-modal').classList.remove('visible');
}

async function testProvider() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Testing...';
  const resultDiv = document.getElementById('pm-result');
  resultDiv.className = 'result-area';
  resultDiv.style.display = 'block';

  try {
    const data = await apiCall('/providers/test', {
      method: 'POST',
      body: {
        type: document.getElementById('pm-type').value,
        apiKey: document.getElementById('pm-api-key').value,
        baseUrl: document.getElementById('pm-base-url').value,
        model: document.getElementById('pm-model').value,
      },
    });
    resultDiv.className = `result-area visible ${data.success ? 'success' : 'error'}`;
    resultDiv.textContent = data.message;
  } catch (err) {
    resultDiv.className = 'result-area visible error';
    resultDiv.textContent = `Error: ${err.message}`;
  }
  btn.disabled = false;
  btn.textContent = 'Test Connection';
}

async function saveProvider() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  const resultDiv = document.getElementById('pm-result');
  resultDiv.className = 'result-area';
  resultDiv.style.display = 'block';

  try {
    const body = {
      type: document.getElementById('pm-type').value,
      name: document.getElementById('pm-name').value,
      apiKey: document.getElementById('pm-api-key').value,
      baseUrl: document.getElementById('pm-base-url').value,
      defaultModel: document.getElementById('pm-model').value,
    };
    if (!body.name || !body.apiKey) {
      throw new Error('Name and API Key are required');
    }
    const data = await apiCall('/providers', { method: 'POST', body });
    resultDiv.className = 'result-area visible success';
    resultDiv.textContent = 'Provider added successfully!';
    closeModal();
    loadProviders();
  } catch (err) {
    resultDiv.className = 'result-area visible error';
    resultDiv.textContent = `Error: ${err.message}`;
  }
  btn.disabled = false;
  btn.textContent = 'Save';
}

async function deleteProvider(id) {
  if (!confirm('Delete this provider?')) return;
  try {
    await apiCall(`/providers/${id}`, { method: 'DELETE' });
    loadProviders();
  } catch (err) {
    alert('Failed to delete: ' + err.message);
  }
}

async function executeSmartFill() {
  const providerId = document.getElementById('sf-provider').value;
  const description = document.getElementById('sf-description').value;
  const count = parseInt(document.getElementById('sf-count').value) || 5;
  const resultDiv = document.getElementById('sf-result');

  if (!providerId) return alert('Please select a provider first');
  if (!description) return alert('Please describe the values to generate');

  resultDiv.className = 'result-area visible';
  resultDiv.innerHTML = '<span class="spinner"></span>Generating...';

  try {
    const data = await apiCall('/smart-fill', {
      method: 'POST',
      body: {
        providerId,
        description,
        count,
        context: {
          columnName: 'Smart Fill',
          columnType: 'text',
          existingValues: [],
          rowData: {},
        },
      },
    });
    resultDiv.className = 'result-area visible success';
    resultDiv.innerHTML = '<strong>Generated values:</strong>\n' + data.values.map((v, i) => `${i + 1}. ${escapeHtml(v)}`).join('\n');
  } catch (err) {
    resultDiv.className = 'result-area visible error';
    resultDiv.textContent = `Error: ${err.message}`;
  }
}

async function executeFormula() {
  const providerId = document.getElementById('fm-provider').value;
  const columns = document.getElementById('fm-columns').value.split(',').map(s => s.trim()).filter(Boolean);
  const description = document.getElementById('fm-description').value;
  const resultDiv = document.getElementById('fm-result');

  if (!providerId) return alert('Please select a provider first');
  if (!description) return alert('Please describe the formula');

  resultDiv.className = 'result-area visible';
  resultDiv.innerHTML = '<span class="spinner"></span>Generating formula...';

  try {
    const data = await apiCall('/formula', {
      method: 'POST',
      body: {
        providerId,
        description,
        columnNames: columns,
        columnTypes: Object.fromEntries(columns.map(c => [c, 'text'])),
      },
    });
    resultDiv.className = 'result-area visible success';
    resultDiv.innerHTML = `<strong>Formula:</strong>\n<code>${escapeHtml(data.formula)}</code>\n\n<strong>Explanation:</strong>\n${escapeHtml(data.explanation)}`;
  } catch (err) {
    resultDiv.className = 'result-area visible error';
    resultDiv.textContent = `Error: ${err.message}`;
  }
}

async function executeClassify() {
  const providerId = document.getElementById('cl-provider').value;
  const columnName = document.getElementById('cl-column').value;
  const values = document.getElementById('cl-values').value.split('\n').map(s => s.trim()).filter(Boolean);
  const categories = document.getElementById('cl-categories').value.split(',').map(s => s.trim()).filter(Boolean);
  const resultDiv = document.getElementById('cl-result');

  if (!providerId) return alert('Please select a provider first');
  if (!columnName) return alert('Please enter the column name');
  if (values.length === 0) return alert('Please enter values to classify');

  resultDiv.className = 'result-area visible';
  resultDiv.innerHTML = '<span class="spinner"></span>Classifying...';

  try {
    const data = await apiCall('/classify', {
      method: 'POST',
      body: {
        providerId,
        columnName,
        values,
        existingCategories: categories.length ? categories : undefined,
      },
    });
    resultDiv.className = 'result-area visible success';
    const byCategory = {};
    Object.entries(data.mapping).forEach(([val, cat]) => {
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(val);
    });
    let html = '<strong>Categories:</strong> ' + data.categories.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join(' ') + '\n\n';
    html += '<strong>Mapping:</strong>\n';
    Object.entries(byCategory).forEach(([cat, vals]) => {
      html += `\n${escapeHtml(cat)}:\n  ${vals.map(v => escapeHtml(v)).join(', ')}`;
    });
    resultDiv.innerHTML = html;
  } catch (err) {
    resultDiv.className = 'result-area visible error';
    resultDiv.textContent = `Error: ${err.message}`;
  }
}

async function executeNLPQuery() {
  const providerId = document.getElementById('nlp-provider').value;
  const tableName = document.getElementById('nlp-table').value;
  const columnsStr = document.getElementById('nlp-columns').value;
  const query = document.getElementById('nlp-query').value;
  const resultDiv = document.getElementById('nlp-result');

  if (!providerId) return alert('Please select a provider first');
  if (!query) return alert('Please enter a query');

  const columns = columnsStr.split(',').map(s => {
    const parts = s.trim().split(':');
    return { name: parts[0]?.trim() || '', type: parts[1]?.trim() || 'text' };
  }).filter(c => c.name);

  resultDiv.className = 'result-area visible';
  resultDiv.innerHTML = '<span class="spinner"></span>Analyzing...';

  try {
    const data = await apiCall('/nlp-query', {
      method: 'POST',
      body: {
        providerId,
        query,
        tableInfo: {
          name: tableName || 'Table',
          columns: columns.length ? columns : [{ name: 'field', type: 'text' }],
          sampleData: [],
        },
      },
    });
    resultDiv.className = 'result-area visible success';
    let html = `<strong>Explanation:</strong>\n${escapeHtml(data.explanation)}\n\n`;
    if (data.filter) {
      html += `<strong>Filter:</strong>\n${escapeHtml(JSON.stringify(data.filter, null, 2))}\n`;
    }
    if (data.sort) {
      html += `\n<strong>Sort:</strong>\n${escapeHtml(JSON.stringify(data.sort, null, 2))}\n`;
    }
    if (!data.filter && !data.sort) {
      html += 'No filter or sort criteria were generated. The AI may need more context.';
    }
    resultDiv.innerHTML = html;
  } catch (err) {
    resultDiv.className = 'result-area visible error';
    resultDiv.textContent = `Error: ${err.message}`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) closeModal();
});
