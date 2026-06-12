const fs = require('fs');
let code = fs.readFileSync('app/student/dashboard/page.jsx', 'utf8');

// 1. Add downloadReceipt function before "if (loading) return"
const receiptFn = `
  function downloadReceipt(p) {
    const receiptNo = 'IYS-' + p.year + '-' + String(p.month).substring(0,3).toUpperCase() + '-' + p.id.substring(0,6).toUpperCase();
    const paidDate = p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const studentName = student ? student.name : '';
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>Receipt</title><style>');
    win.document.write('* { margin:0; padding:0; box-sizing:border-box; }');
    win.document.write('body { font-family: Georgia, serif; background:#f5f5f5; display:flex; justify-content:center; padding:40px 20px; }');
    win.document.write('.receipt { background:white; width:480px; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.12); }');
    win.document.write('.header { background:linear-gradient(135deg,#0d2e1c,#1D9E75); padding:2rem; text-align:center; color:white; }');
    win.document.write('.logo { width:70px; height:70px; border-radius:50%; border:3px solid rgba(201,168,76,0.6); margin:0 auto 0.75rem; display:block; }');
    win.document.write('.studio-name { font-size:1.4rem; font-weight:800; color:#F4C87A; letter-spacing:0.05em; }');
    win.document.write('.studio-sub { font-size:0.8rem; color:rgba(255,255,255,0.7); margin-top:4px; }');
    win.document.write('.receipt-title { background:#F4C87A; color:#0d2e1c; text-align:center; padding:0.6rem; font-size:0.85rem; font-weight:800; letter-spacing:0.15em; text-transform:uppercase; }');
    win.document.write('.body { padding:1.75rem; }');
    win.document.write('.receipt-no { text-align:right; font-size:0.78rem; color:#9ca3af; margin-bottom:1.25rem; }');
    win.document.write('.row { display:flex; justify-content:space-between; padding:0.65rem 0; border-bottom:1px solid #f3f4f6; font-size:0.88rem; }');
    win.document.write('.label { color:#6b7280; font-weight:500; }');
    win.document.write('.value { color:#1a2018; font-weight:600; }');
    win.document.write('.amount-box { background:linear-gradient(135deg,#E8F5E0,#f0faf5); border:2px solid #1D9E75; border-radius:10px; padding:1.25rem; text-align:center; margin:1.25rem 0; }');
    win.document.write('.amount-label { font-size:0.75rem; color:#5a7a6a; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.4rem; }');
    win.document.write('.amount-value { font-size:2.2rem; font-weight:800; color:#1D9E75; }');
    win.document.write('.paid-stamp { background:#1D9E75; color:white; font-size:1.1rem; font-weight:800; letter-spacing:0.2em; padding:0.5rem 1.5rem; border-radius:6px; display:inline-block; transform:rotate(-3deg); margin:0.5rem 0; }');
    win.document.write('.footer { border-top:2px dashed #e5e7eb; padding:1.25rem 1.75rem; text-align:center; }');
    win.document.write('.sig-line { border-top:1px solid #1a2018; width:160px; margin:0.5rem auto 0; }');
    win.document.write('.sig-label { font-size:0.75rem; color:#6b7280; margin-top:4px; }');
    win.document.write('.note { font-size:0.72rem; color:#9ca3af; margin-top:1rem; font-style:italic; }');
    win.document.write('</style></head><body onload="window.print()">');
    win.document.write('<div class="receipt">');
    win.document.write('<div class="header">');
    win.document.write('<img src="https://irayoga.vercel.app/logo.png" class="logo" alt="logo" />');
    win.document.write('<div class="studio-name">Indira Yoga Studio</div>');
    win.document.write('<div class="studio-sub">Therapeutic Yoga · Hatha · Pranayama</div>');
    win.document.write('</div>');
    win.document.write('<div class="receipt-title">Payment Receipt</div>');
    win.document.write('<div class="body">');
    win.document.write('<div class="receipt-no">Receipt No: ' + receiptNo + '</div>');
    win.document.write('<div class="row"><span class="label">Student Name</span><span class="value">' + studentName + '</span></div>');
    win.document.write('<div class="row"><span class="label">Period</span><span class="value">' + p.month + ' ' + p.year + '</span></div>');
    win.document.write('<div class="row"><span class="label">Payment Date</span><span class="value">' + paidDate + '</span></div>');
    if (p.notes) win.document.write('<div class="row"><span class="label">Description</span><span class="value">' + p.notes + '</span></div>');
    win.document.write('<div class="amount-box">');
    win.document.write('<div class="amount-label">Amount Paid</div>');
    win.document.write('<div class="amount-value">Rs.' + p.amount.toLocaleString() + '</div>');
    win.document.write('</div>');
    win.document.write('<div style="text-align:center"><span class="paid-stamp">PAID</span></div>');
    win.document.write('</div>');
    win.document.write('<div class="footer">');
    win.document.write('<div class="sig-line"></div>');
    win.document.write('<div class="sig-label">Authorized Signature — Indira Yoga Studio</div>');
    win.document.write('<div class="note">This is a computer generated receipt. Valid for reimbursement purposes.</div>');
    win.document.write('</div></div></body></html>');
    win.document.close();
  }
`;

code = code.replace(
  '  if (loading) return (',
  receiptFn + '\n  if (loading) return ('
);

// 2. Add Receipt button after the paid badge
const oldBadge = `<div style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: p.status === "paid" ? "#E8F5E0" : "#FEF2F2", color: p.status === "paid" ? "#0F6E56" : "#DC2626", marginTop: "4px", display: "inline-block" }}>
                          {p.status === "paid" ? "Paid ✓" : "Due"}
                        </div>`;

const newBadge = `<div style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: p.status === "paid" ? "#E8F5E0" : "#FEF2F2", color: p.status === "paid" ? "#0F6E56" : "#DC2626", marginTop: "4px", display: "inline-block" }}>
                          {p.status === "paid" ? "Paid ✓" : "Due"}
                        </div>
                        {p.status === "paid" && (
                          <button onClick={() => downloadReceipt(p)} style={{ display: "block", marginTop: "6px", background: "none", border: "1px solid #1D9E75", color: "#1D9E75", borderRadius: "6px", padding: "2px 8px", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer", width: "100%" }}>
                            Receipt
                          </button>
                        )}`;

code = code.replace(oldBadge, newBadge);

fs.writeFileSync('app/student/dashboard/page.jsx', code);
console.log('Done! downloadReceipt function added.');
