const fs = require('fs');
let code = fs.readFileSync('/c/Users/Chakri/yoga-app/app/student/dashboard/page.jsx', 'utf8');

// 1. Add payments tab to tab list
code = code.replace(
  '{ id: "notes",    icon: "📝", label: unreadCount > 0 ? `Notes 🔴${unreadCount}` : "Notes" },',
  '{ id: "notes",    icon: "📝", label: unreadCount > 0 ? `Notes 🔴${unreadCount}` : "Notes" },\n            { id: "payments", icon: "💰", label: "Payments" },'
);

// 2. Add payments tab content before the footer
const paymentsTab = `
          {activeTab === "payments" && (
            <div style={{ padding: "0.5rem 0" }}>
              {myPayments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💳</div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1a2018", marginBottom: "0.5rem" }}>No payment records yet</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Your payment history will appear here.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Summary */}
                  {(() => {
                    const total = myPayments.reduce((s, p) => s + p.amount, 0);
                    const paid = myPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
                    const due = myPayments.filter(p => p.status === "unpaid").reduce((s, p) => s + p.amount, 0);
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <div style={{ background: "linear-gradient(135deg,#E8F5E0,#F0FAF4)", borderRadius: "14px", padding: "1rem", textAlign: "center", border: "1px solid #c8e6d8" }}>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1D9E75", fontFamily: "serif" }}>₹{paid.toLocaleString()}</div>
                          <div style={{ fontSize: "0.7rem", color: "#5a7a6a", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Paid</div>
                        </div>
                        <div style={{ background: "#FEF2F2", borderRadius: "14px", padding: "1rem", textAlign: "center", border: "1px solid #fca5a5" }}>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#DC2626", fontFamily: "serif" }}>₹{due.toLocaleString()}</div>
                          <div style={{ fontSize: "0.7rem", color: "#b91c1c", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Due</div>
                        </div>
                        <div style={{ background: "#F9FAFB", borderRadius: "14px", padding: "1rem", textAlign: "center", border: "1px solid #e5e7eb" }}>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#374151", fontFamily: "serif" }}>₹{total.toLocaleString()}</div>
                          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment list */}
                  {myPayments.map(p => (
                    <div key={p.id} style={{ background: "white", borderRadius: "14px", padding: "1rem 1.25rem", border: "1px solid #e8ede8", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: p.status === "paid" ? "#E8F5E0" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                          {p.status === "paid" ? "✅" : "⏳"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1a2018" }}>{p.month} {p.year}</div>
                          {p.notes && <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "2px" }}>{p.notes}</div>}
                          {p.paidAt && <div style={{ fontSize: "0.72rem", color: "#1D9E75", marginTop: "2px" }}>Paid on {new Date(p.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: p.status === "paid" ? "#1D9E75" : "#DC2626", fontFamily: "serif" }}>₹{p.amount.toLocaleString()}</div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: p.status === "paid" ? "#E8F5E0" : "#FEF2F2", color: p.status === "paid" ? "#0F6E56" : "#DC2626", marginTop: "4px", display: "inline-block" }}>
                          {p.status === "paid" ? "Paid ✓" : "Due"}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* WhatsApp for dues */}
                  {myPayments.some(p => p.status === "unpaid") && (
                    <a href={"https://wa.me/917996272792?text=Hi%20Navira%20Yoga%20Studio%2C%20I%20am%20" + encodeURIComponent(student?.name || "") + "%20and%20I%20would%20like%20to%20clear%20my%20pending%20payment."} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem", background: "#25D366", color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      💬 Contact Instructor to Pay
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
`;

code = code.replace(
  '        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#C8BFB0", padding: "2rem 1rem 1.5rem", fontFamily: "serif", fontStyle: "italic" }}>',
  paymentsTab + '\n        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#C8BFB0", padding: "2rem 1rem 1.5rem", fontFamily: "serif", fontStyle: "italic" }}>'
);

fs.writeFileSync('/c/Users/Chakri/yoga-app/app/student/dashboard/page.jsx', code);
console.log('Done');
