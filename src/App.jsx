import { useState, useEffect } from “react”;

const CATEGORIES = [“Philosophy”, “Game Development”, “Gen Ed”];
const CAT_COLORS = {
Philosophy: “#a78bfa”,
“Game Development”: “#4ade80”,
“Gen Ed”: “#38bdf8”,
};
const CAT_BG = {
Philosophy: “#a78bfa18”,
“Game Development”: “#4ade8018”,
“Gen Ed”: “#38bdf818”,
};

const SEMESTERS = [
“Fall Year 1”, “Spring Year 1”,
“Fall Year 2”, “Spring Year 2”,
“Fall Year 3”, “Spring Year 3”,
“Fall Year 4”, “Spring Year 4”,
];

function genId() {
return Math.random().toString(36).slice(2, 9);
}

export default function CoursePlanner() {
const [courses, setCourses] = useState(() => {
try {
const saved = localStorage.getItem(“course-planner-courses”);
return saved ? JSON.parse(saved) : [];
} catch { return []; }
});

useEffect(() => {
try { localStorage.setItem(“course-planner-courses”, JSON.stringify(courses)); }
catch { /* storage full or unavailable */ }
}, [courses]);
const [modal, setModal] = useState(null);
const [editId, setEditId] = useState(null);
const [expanded, setExpanded] = useState(null);
const [hoveredPrereq, setHoveredPrereq] = useState(null);
const [prereqSearch, setPrereqSearch] = useState(””);
const [dragId, setDragId] = useState(null);
const [dragOver, setDragOver] = useState(null);
const [form, setForm] = useState(emptyForm());

function emptyForm() {
return { name: “”, code: “”, units: 3, semester: “Pool”, categories: [], prerequisiteIds: [], notes: “” };
}

function openAdd() {
setForm(emptyForm());
setEditId(null);
setModal(“add”);
setPrereqSearch(””);
}

function openEdit(course) {
setForm({ …course });
setEditId(course.id);
setModal(“edit”);
setPrereqSearch(””);
}

function save() {
if (!form.name.trim()) return;
if (editId) {
setCourses(cs => cs.map(c => c.id === editId ? { …form, id: editId } : c));
} else {
setCourses(cs => […cs, { …form, id: genId() }]);
}
setModal(null);
}

function remove(id) {
setCourses(cs => cs.filter(c => c.id !== id).map(c => ({ …c, prerequisiteIds: c.prerequisiteIds.filter(p => p !== id) })));
if (expanded === id) setExpanded(null);
}

function toggleCat(cat) {
setForm(f => ({ …f, categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : […f.categories, cat] }));
}

function togglePrereq(id) {
setForm(f => ({ …f, prerequisiteIds: f.prerequisiteIds.includes(id) ? f.prerequisiteIds.filter(p => p !== id) : […f.prerequisiteIds, id] }));
}

function getCourse(id) { return courses.find(c => c.id === id); }
function usedBy(id) { return courses.filter(c => c.prerequisiteIds.includes(id)); }

function onDragStart(e, id) {
setDragId(id);
e.dataTransfer.effectAllowed = “move”;
}
function onDragOver(e, sem) {
e.preventDefault();
e.dataTransfer.dropEffect = “move”;
setDragOver(sem);
}
function onDrop(e, sem) {
e.preventDefault();
if (dragId) {
setCourses(cs => cs.map(c => c.id === dragId ? { …c, semester: sem } : c));
}
setDragId(null);
setDragOver(null);
}
function onDragEnd() {
setDragId(null);
setDragOver(null);
}

const bySem = (sem) => courses.filter(c => c.semester === sem);
const totalUnits = (sem) => bySem(sem).reduce((s, c) => s + Number(c.units), 0);

const prereqOptions = courses.filter(c =>
c.id !== editId &&
!form.prerequisiteIds.includes(c.id) &&
(c.name.toLowerCase().includes(prereqSearch.toLowerCase()) || c.code.toLowerCase().includes(prereqSearch.toLowerCase()))
);

return (
<div style={{ minHeight: “100vh”, background: “#f7f6f3”, fontFamily: “‘Epilogue’, Georgia, serif”, color: “#1a1a1a” }}>
<style>{`
@import url(‘https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600&family=Fraunces:ital,wght@0,400;0,600;1,400&display=swap’);
* { box-sizing: border-box; margin: 0; padding: 0; }

```
 .card {
 background: #fff;
 border-radius: 10px;
 border: 1.5px solid #e8e6e0;
 padding: 12px 14px;
 margin-bottom: 8px;
 cursor: grab;
 transition: box-shadow 0.15s, opacity 0.15s, border-color 0.15s;
 position: relative;
 }
 .card:last-child { margin-bottom: 0; }
 .card:active { cursor: grabbing; }
 .card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.07); border-color: #d4d0c8; }
 .card.dragging { opacity: 0.35; }
 .card.prereq-hl { border-color: #f59e0b !important; box-shadow: 0 0 0 3px #fde68a55; }

 .sem-col {
 background: #f0ede8;
 border-radius: 12px;
 padding: 14px 12px;
 transition: background 0.15s, box-shadow 0.15s;
 min-height: 80px;
 }
 .sem-col.drag-over { background: #e8f4ff; box-shadow: inset 0 0 0 2px #93c5fd; }

 .pool-wrap {
 background: #eeecea;
 border-radius: 14px;
 padding: 20px 24px;
 min-height: 100px;
 transition: background 0.15s, box-shadow 0.15s;
 }
 .pool-wrap.drag-over { background: #e8f4ff; box-shadow: inset 0 0 0 2px #93c5fd; }

 .pool-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
 gap: 10px;
 margin-top: 14px;
 }
 .pool-grid .card { margin-bottom: 0; }

 .tag {
 display: inline-block;
 font-size: 10px;
 padding: 2px 8px;
 border-radius: 20px;
 font-family: 'Epilogue', sans-serif;
 font-weight: 500;
 letter-spacing: 0.03em;
 }

 .btn {
 padding: 8px 18px;
 border-radius: 8px;
 border: 1.5px solid #ddd;
 background: #fff;
 color: #1a1a1a;
 font-family: 'Epilogue', sans-serif;
 font-size: 13px;
 cursor: pointer;
 transition: all 0.12s;
 }
 .btn:hover { background: #f0ede8; border-color: #ccc; }
 .btn.primary { background: #1a1a1a; color: #f7f6f3; border-color: #1a1a1a; }
 .btn.primary:hover { background: #2d2d2d; }
 .btn.danger { border-color: #fca5a5; color: #ef4444; background: transparent; }
 .btn.danger:hover { background: #fff5f5; }
 .btn.sm { padding: 5px 12px; font-size: 12px; }

 .modal-bg {
 position: fixed; inset: 0;
 background: rgba(250,249,247,0.7);
 backdrop-filter: blur(6px);
 z-index: 100;
 display: flex; align-items: center; justify-content: center;
 padding: 20px;
 }
 .modal {
 background: #fff;
 border-radius: 16px;
 padding: 28px 30px;
 width: 100%;
 max-width: 500px;
 max-height: 90vh;
 overflow-y: auto;
 box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px #e8e6e0;
 }

 label { font-size: 11px; color: #999; letter-spacing: 0.07em; text-transform: uppercase; display: block; margin-bottom: 5px; font-family: 'Epilogue', sans-serif; }
 input, select, textarea {
 background: #f7f6f3;
 border: 1.5px solid #e8e6e0;
 border-radius: 8px;
 color: #1a1a1a;
 font-family: 'Epilogue', sans-serif;
 font-size: 13px;
 padding: 9px 12px;
 width: 100%;
 outline: none;
 transition: border-color 0.12s, background 0.12s;
 }
 input:focus, select:focus, textarea:focus { border-color: #bbb; background: #fff; }
 select option { background: #fff; }

 .cat-row {
 display: flex; align-items: center; gap: 10px;
 padding: 8px 12px;
 border-radius: 8px;
 border: 1.5px solid #e8e6e0;
 cursor: pointer;
 margin-bottom: 6px;
 transition: all 0.12s;
 font-size: 13px;
 font-family: 'Epilogue', sans-serif;
 user-select: none;
 }
 .cat-row:hover { border-color: #ccc; }
 .cat-row.on { border-color: var(--cc); background: var(--cb); }

 .chip {
 display: inline-flex; align-items: center; gap: 4px;
 background: #f0ede8; border: 1.5px solid #e0ddd6;
 border-radius: 6px; padding: 3px 6px 3px 10px;
 font-size: 11px; font-family: 'Epilogue', sans-serif;
 margin: 3px 3px 3px 0;
 }
 .chip-x { background: none; border: none; cursor: pointer; color: #bbb; font-size: 16px; line-height: 1; padding: 0; }
 .chip-x:hover { color: #ef4444; }

 .p-opt {
 padding: 7px 12px; cursor: pointer; font-size: 12px;
 font-family: 'Epilogue', sans-serif; border-radius: 6px; transition: background 0.1s;
 }
 .p-opt:hover { background: #f0ede8; }

 .expand {
 margin-top: 10px; padding-top: 10px;
 border-top: 1px solid #f0ede8;
 animation: fs 0.16s ease;
 }
 @keyframes fs { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; } }

 .upill { font-size: 10px; color: #aaa; background: #f0ede8; border-radius: 20px; padding: 2px 8px; font-family: 'Epilogue', sans-serif; white-space: nowrap; }

 ::-webkit-scrollbar { width: 5px; height: 5px; }
 ::-webkit-scrollbar-track { background: transparent; }
 ::-webkit-scrollbar-thumb { background: #d4d0c8; border-radius: 3px; }
 `}</style>

 {/* Top bar */}
 <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "1px solid #ede9e3" }}>
 <div>
 <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>course planner</div>
 <div style={{ fontSize: 11, color: "#bbb", marginTop: 2, fontFamily: "'Epilogue', sans-serif" }}>
 {courses.length} courses · {courses.reduce((s, c) => s + Number(c.units), 0)} units total
 </div>
 </div>
 <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
 <div style={{ display: "flex", gap: 12 }}>
 {CATEGORIES.map(cat => (
 <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#aaa", fontFamily: "'Epilogue', sans-serif" }}>
 <div style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[cat] }} />
 {cat}
 </div>
 ))}
 </div>
 <button className="btn primary" onClick={openAdd}>+ add course</button>
 </div>
 </div>

 {/* Year grid */}
 <div style={{ padding: "20px 28px 10px", overflowX: "auto" }}>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, minWidth: 820 }}>
 {/* Year headings */}
 {[1,2,3,4].map(y => (
 <div key={y} style={{ textAlign: "center", fontFamily: "'Epilogue', sans-serif", fontSize: 10, color: "#ccc", letterSpacing: "0.1em", textTransform: "uppercase", paddingBottom: 6 }}>
 year {y}
 </div>
 ))}

 {/* Two semesters per year column */}
 {[0,2,4,6].map(i => {
 const fa = SEMESTERS[i];
 const sp = SEMESTERS[i+1];
 return (
 <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
 {[fa, sp].map(sem => {
 const cards = bySem(sem);
 const isOver = dragOver === sem;
 const isFall = sem.startsWith("Fall");
 return (
 <div
 key={sem}
 className={`sem-col${isOver ? " drag-over" : ""}`}
 onDragOver={e => onDragOver(e, sem)}
 onDrop={e => onDrop(e, sem)}
 onDragLeave={() => dragOver === sem && setDragOver(null)}
 >
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
 <span style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 600, color: "#555" }}>
 {isFall ? "fall" : "spring"}
 </span>
 <span className="upill">{totalUnits(sem)}u</span>
 </div>
 {cards.length === 0
 ? <div style={{ border: "1.5px dashed #d4d0c8", borderRadius: 8, padding: "16px", textAlign: "center", color: "#ccc", fontSize: 11, fontFamily: "'Epilogue', sans-serif" }}>drop here</div>
 : cards.map(course => (
 <CourseCard key={course.id} course={course} expanded={expanded} setExpanded={setExpanded} hoveredPrereq={hoveredPrereq} setHoveredPrereq={setHoveredPrereq} onEdit={openEdit} onDelete={remove} getCourse={getCourse} usedBy={usedBy} dragId={dragId} onDragStart={onDragStart} onDragEnd={onDragEnd} />
 ))
 }
 </div>
 );
 })}
 </div>
 );
 })}
 </div>
 </div>

 {/* Pool */}
 <div style={{ padding: "8px 28px 48px" }}>
 <div
 className={`pool-wrap${dragOver === "Pool" ? " drag-over" : ""}`}
 onDragOver={e => onDragOver(e, "Pool")}
 onDrop={e => onDrop(e, "Pool")}
 onDragLeave={() => dragOver === "Pool" && setDragOver(null)}
 >
 <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
 <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: "#666" }}>pool</span>
 <span style={{ fontFamily: "'Epilogue', sans-serif", fontSize: 11, color: "#bbb" }}>
 {bySem("Pool").length} unassigned · {totalUnits("Pool")}u
 </span>
 </div>

 {bySem("Pool").length === 0 ? (
 <div style={{ marginTop: 14, border: "1.5px dashed #d4d0c8", borderRadius: 10, padding: "30px 20px", textAlign: "center", color: "#ccc", fontSize: 12, fontFamily: "'Epilogue', sans-serif" }}>
 new courses land here — drag them up to a semester
 </div>
 ) : (
 <div className="pool-grid">
 {bySem("Pool").map(course => (
 <CourseCard key={course.id} course={course} expanded={expanded} setExpanded={setExpanded} hoveredPrereq={hoveredPrereq} setHoveredPrereq={setHoveredPrereq} onEdit={openEdit} onDelete={remove} getCourse={getCourse} usedBy={usedBy} dragId={dragId} onDragStart={onDragStart} onDragEnd={onDragEnd} />
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Modal */}
 {modal && (
 <div className="modal-bg" onClick={() => setModal(null)}>
 <div className="modal" onClick={e => e.stopPropagation()}>
 <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, marginBottom: 22 }}>
 {modal === "edit" ? "edit course" : "add a course"}
 </div>

 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
 <div style={{ gridColumn: "1/-1" }}>
 <label>Name</label>
 <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Intro to Philosophy" autoFocus />
 </div>
 <div>
 <label>Code</label>
 <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="PHIL 101" />
 </div>
 <div>
 <label>Units</label>
 <input type="number" min={1} max={12} value={form.units} onChange={e => setForm(f => ({ ...f, units: Number(e.target.value) }))} />
 </div>
 <div style={{ gridColumn: "1/-1" }}>
 <label>Semester</label>
 <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
 <option value="Pool">Pool (unassigned)</option>
 {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 </div>

 <div style={{ marginBottom: 16 }}>
 <label style={{ marginBottom: 8 }}>Categories</label>
 {CATEGORIES.map(cat => (
 <div
 key={cat}
 className={`cat-row${form.categories.includes(cat) ? " on" : ""}`}
 style={{ "--cc": CAT_COLORS[cat], "--cb": CAT_BG[cat] }}
 onClick={() => toggleCat(cat)}
 >
 <div style={{ width: 11, height: 11, borderRadius: "50%", background: CAT_COLORS[cat], opacity: form.categories.includes(cat) ? 1 : 0.25, flexShrink: 0, transition: "opacity 0.12s" }} />
 {cat}
 </div>
 ))}
 </div>

 <div style={{ marginBottom: 16 }}>
 <label style={{ marginBottom: 8 }}>Prerequisites</label>
 {form.prerequisiteIds.length > 0 && (
 <div style={{ marginBottom: 8 }}>
 {form.prerequisiteIds.map(pid => {
 const pc = courses.find(c => c.id === pid);
 return pc ? (
 <span key={pid} className="chip">
 {pc.code || pc.name}
 <button className="chip-x" onClick={() => togglePrereq(pid)}>×</button>
 </span>
 ) : null;
 })}
 </div>
 )}
 <input value={prereqSearch} onChange={e => setPrereqSearch(e.target.value)} placeholder="search to link a prerequisite…" />
 {prereqSearch && (
 <div style={{ background: "#f7f6f3", border: "1.5px solid #e8e6e0", borderRadius: 8, marginTop: 6, maxHeight: 150, overflowY: "auto" }}>
 {prereqOptions.length === 0
 ? <div style={{ padding: "10px 12px", fontSize: 12, color: "#ccc", fontFamily: "'Epilogue', sans-serif" }}>no matches</div>
 : prereqOptions.map(c => (
 <div key={c.id} className="p-opt" onClick={() => { togglePrereq(c.id); setPrereqSearch(""); }}>
 <span style={{ color: "#bbb", marginRight: 6 }}>{c.code}</span>{c.name}
 <span style={{ color: "#ccc", fontSize: 10, marginLeft: 5 }}>{c.units}u</span>
 </div>
 ))
 }
 </div>
 )}
 </div>

 <div style={{ marginBottom: 22 }}>
 <label>Notes</label>
 <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="anything else…" style={{ resize: "vertical" }} />
 </div>

 <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
 <button className="btn sm" onClick={() => setModal(null)}>cancel</button>
 <button className="btn primary sm" onClick={save}>{modal === "edit" ? "save" : "add"}</button>
 </div>
 </div>
 </div>
 )}
</div>
```

);
}

function CourseCard({ course, expanded, setExpanded, hoveredPrereq, setHoveredPrereq, onEdit, onDelete, getCourse, usedBy, dragId, onDragStart, onDragEnd }) {
const isExpanded = expanded === course.id;
const isHl = hoveredPrereq === course.id;
const isDragging = dragId === course.id;
const prereqsOf = usedBy(course.id);

return (
<div
draggable
onDragStart={e => onDragStart(e, course.id)}
onDragEnd={onDragEnd}
className={`card${isDragging ? " dragging" : ""}${isHl ? " prereq-hl" : ""}`}
onClick={() => setExpanded(isExpanded ? null : course.id)}
>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, gap: 8 }}>
<div style={{ flex: 1, minWidth: 0 }}>
{course.code && (
<div style={{ fontSize: 10, color: “#bbb”, marginBottom: 2, fontFamily: “‘Epilogue’, sans-serif”, letterSpacing: “0.04em” }}>{course.code}</div>
)}
<div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35, color: “#1a1a1a”, fontFamily: “‘Epilogue’, sans-serif” }}>{course.name}</div>
</div>
<span className="upill">{course.units}u</span>
</div>

```
 {course.categories.length > 0 && (
 <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
 {course.categories.map(cat => (
 <span key={cat} className="tag" style={{ background: CAT_BG[cat], color: CAT_COLORS[cat] }}>{cat}</span>
 ))}
 </div>
 )}

 {isExpanded && (
 <div className="expand" onClick={e => e.stopPropagation()}>
 {course.prerequisiteIds.length > 0 && (
 <div style={{ marginBottom: 10 }}>
 <div style={{ fontSize: 10, color: "#ccc", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Epilogue', sans-serif" }}>needs</div>
 {course.prerequisiteIds.map(pid => {
 const pc = getCourse(pid);
 return pc ? (
 <div key={pid} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 12, fontFamily: "'Epilogue', sans-serif", cursor: "default" }}
 onMouseEnter={() => setHoveredPrereq(pid)}
 onMouseLeave={() => setHoveredPrereq(null)}
 >
 <span style={{ color: "#f59e0b", fontSize: 11 }}>→</span>
 <span style={{ color: "#555" }}>{pc.code || pc.name}</span>
 {pc.code && <span style={{ color: "#bbb" }}>{pc.name}</span>}
 </div>
 ) : null;
 })}
 </div>
 )}

 {prereqsOf.length > 0 && (
 <div style={{ marginBottom: 10 }}>
 <div style={{ fontSize: 10, color: "#ccc", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Epilogue', sans-serif" }}>unlocks</div>
 {prereqsOf.map(rc => (
 <div key={rc.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontSize: 12, fontFamily: "'Epilogue', sans-serif" }}>
 <span style={{ color: "#60a5fa", fontSize: 11 }}>→</span>
 <span style={{ color: "#555" }}>{rc.code || rc.name}</span>
 </div>
 ))}
 </div>
 )}

 {course.notes && (
 <div style={{ marginBottom: 10, fontSize: 12, color: "#999", lineHeight: 1.5, fontFamily: "'Epilogue', sans-serif" }}>{course.notes}</div>
 )}

 <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
 <button className="btn sm" style={{ flex: 1 }} onClick={() => onEdit(course)}>edit</button>
 <button className="btn sm danger" style={{ flex: 1 }} onClick={() => onDelete(course.id)}>delete</button>
 </div>
 </div>
 )}
</div>
```

);
}
