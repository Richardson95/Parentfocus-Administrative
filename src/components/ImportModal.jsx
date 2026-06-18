import { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, ArrowRight, ArrowLeft,
} from 'lucide-react';
import Modal from './Modal.jsx';
import { useToast } from './Toast.jsx';

/* Target fields a student row maps to. */
const TARGET_FIELDS = [
  { key: 'name', label: 'Full Name', required: true },
  { key: 'class', label: 'Class', required: true },
  { key: 'gender', label: 'Gender', required: false },
  { key: 'admissionNo', label: 'Admission No.', required: false },
  { key: 'parentName', label: 'Parent / Guardian', required: false },
  { key: 'parentPhone', label: 'Parent Phone', required: false },
];

// Best-effort auto-match of a spreadsheet column header to a target field.
function autoMatch(header) {
  const h = header.toLowerCase().replace(/[^a-z]/g, '');
  if (/(fullname|studentname|name|pupil)/.test(h)) return 'name';
  if (/(class|grade|level|arm)/.test(h)) return 'class';
  if (/(gender|sex)/.test(h)) return 'gender';
  if (/(admission|admno|regno|registration|studentid)/.test(h)) return 'admissionNo';
  if (/(parent|guardian)/.test(h) && /(phone|tel|mobile|contact)/.test(h)) return 'parentPhone';
  if (/(parent|guardian|father|mother|sponsor)/.test(h) && /name/.test(h)) return 'parentName';
  if (/(phone|tel|mobile|contact)/.test(h)) return 'parentPhone';
  if (/(parent|guardian|father|mother)/.test(h)) return 'parentName';
  return '';
}

export default function ImportModal({ schoolName, onClose, onImport }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [step, setStep] = useState(1); // 1 upload, 2 map, 3 preview
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});

  const parseFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!json.length) { toast.error('That file appears to be empty.'); return; }
        const cols = Object.keys(json[0]);
        setHeaders(cols);
        setRows(json);
        const initMap = {};
        cols.forEach((c) => { const m = autoMatch(c); if (m && !Object.values(initMap).includes(m)) initMap[c] = m; });
        setMapping(initMap);
        setStep(2);
      } catch {
        toast.error('Could not read the file. Please upload a valid CSV or Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const mappedFields = Object.values(mapping);
  const missingRequired = TARGET_FIELDS.filter((f) => f.required && !mappedFields.includes(f.key));

  const preview = useMemo(() => {
    return rows.map((r) => {
      const obj = {};
      Object.entries(mapping).forEach(([col, field]) => { if (field) obj[field] = String(r[col] ?? '').trim(); });
      return obj;
    });
  }, [rows, mapping]);

  const validRows = preview.filter((r) => r.name && r.class);
  const invalidCount = preview.length - validRows.length;

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Full Name': 'John Doe', 'Class': 'JSS 1A', 'Gender': 'Male', 'Admission No': 'SCH/2026/001', 'Parent Name': 'Mr. Doe', 'Parent Phone': '+234 800 000 0000' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'parentfocus-students-template.xlsx');
  };

  const footer =
    step === 1 ? (
      <>
        <button className="btn btn-ghost" onClick={downloadTemplate}><Download size={16} /> Template</button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </>
    ) : step === 2 ? (
      <>
        <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
        <button className="btn btn-primary" disabled={missingRequired.length > 0} onClick={() => setStep(3)}>
          Preview <ArrowRight size={16} />
        </button>
      </>
    ) : (
      <>
        <button className="btn btn-ghost" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
        <button className="btn btn-gold" disabled={!validRows.length}
          onClick={() => { onImport(validRows); toast.success(`Imported ${validRows.length} students into ${schoolName}`); }}>
          <CheckCircle2 size={16} /> Import {validRows.length} students
        </button>
      </>
    );

  return (
    <Modal title="Import students from CSV / Excel" onClose={onClose} large footer={footer}>
      {/* Stepper */}
      <div className="flex items-center gap-sm mb" style={{ fontSize: 12, fontWeight: 700 }}>
        {['Upload file', 'Map columns', 'Review & import'].map((s, i) => (
          <div key={s} className="flex items-center gap-sm">
            <span className="badge" style={{ background: step >= i + 1 ? 'var(--blue)' : 'var(--bg-alt)', color: step >= i + 1 ? '#fff' : 'var(--muted)' }}>{i + 1}</span>
            <span style={{ color: step >= i + 1 ? 'var(--text)' : 'var(--muted)' }}>{s}</span>
            {i < 2 && <span className="text-muted">———</span>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div
            className={`dropzone ${drag ? 'drag' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); parseFile(e.dataTransfer.files[0]); }}
          >
            <div className="empty-icon" style={{ margin: '0 auto 12px' }}><UploadCloud size={28} /></div>
            <h3 style={{ fontSize: 16 }}>Drop your file here, or click to browse</h3>
            <p className="text-muted mt-sm">Supports <b>.csv</b>, <b>.xlsx</b> and <b>.xls</b> — first sheet is used.</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={(e) => parseFile(e.target.files[0])} />
          </div>
          <div className="card mt" style={{ background: 'var(--info-bg)', borderColor: 'transparent' }}>
            <div className="card-pad flex gap-sm">
              <FileSpreadsheet size={18} color="var(--blue)" />
              <p className="text-sm">Not sure of the format? <button className="fw-800" style={{ color: 'var(--blue)' }} onClick={downloadTemplate}>Download the template</button> with the recommended columns.</p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm text-muted mb">Detected <b>{rows.length}</b> rows in <b>{fileName}</b>. Match each spreadsheet column to a ParentFocus field. We auto-matched what we could.</p>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Spreadsheet column</th><th>Sample value</th><th>Maps to →</th></tr></thead>
              <tbody>
                {headers.map((h) => (
                  <tr key={h}>
                    <td className="cell-main">{h}</td>
                    <td className="cell-sub truncate" style={{ maxWidth: 160 }}>{String(rows[0]?.[h] ?? '')}</td>
                    <td>
                      <select className="select" value={mapping[h] || ''} onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))} style={{ maxWidth: 220 }}>
                        <option value="">— Ignore —</option>
                        {TARGET_FIELDS.map((f) => (
                          <option key={f.key} value={f.key} disabled={mappedFields.includes(f.key) && mapping[h] !== f.key}>
                            {f.label}{f.required ? ' *' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {missingRequired.length > 0 && (
            <div className="badge badge-warning mt" style={{ padding: '8px 12px' }}>
              <AlertTriangle size={14} /> Required field(s) not mapped: {missingRequired.map((f) => f.label).join(', ')}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="flex gap wrap mb">
            <span className="badge badge-success"><CheckCircle2 size={13} /> {validRows.length} valid</span>
            {invalidCount > 0 && <span className="badge badge-error"><AlertTriangle size={13} /> {invalidCount} skipped (missing name/class)</span>}
          </div>
          <div className="table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>#</th><th>Name</th><th>Class</th><th>Gender</th><th>Admission</th><th>Parent</th></tr></thead>
              <tbody>
                {validRows.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td className="cell-sub">{i + 1}</td>
                    <td className="cell-main">{r.name}</td>
                    <td>{r.class}</td>
                    <td>{r.gender || '—'}</td>
                    <td className="cell-sub">{r.admissionNo || '—'}</td>
                    <td className="cell-sub">{r.parentName || '—'}{r.parentPhone ? ` · ${r.parentPhone}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {validRows.length > 50 && <p className="hint mt-sm">Showing first 50 of {validRows.length} rows.</p>}
        </div>
      )}
    </Modal>
  );
}
