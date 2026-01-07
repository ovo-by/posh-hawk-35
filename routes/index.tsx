export default function Test() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1 style={{ color: "red" }}>看到这段文字说明环境正常！</h1>
      <p>现在时间：{new Date().toLocaleTimeString()}</p>
    </div>
  );
}
