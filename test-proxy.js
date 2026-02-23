fetch("http://localhost:3000/api/v1/schemas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ assetType: "tool_configs", assetId: "run_cmd" })
}).then(res => {
  console.log("Status:", res.status);
  return res.text();
}).then(text => console.log("Body:", text.substring(0, 100)))
.catch(err => console.error("Error:", err));
