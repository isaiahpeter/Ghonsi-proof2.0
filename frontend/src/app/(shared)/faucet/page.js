'use client';
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const USDT_MINT = process.env.NEXT_PUBLIC_USDT_MINT || "9QR25RvDUtqiTs1ibmVbqrY4V3NgD6VLVtstbwxBdHg";

export default function UsdtFaucet() {
    const [wallet, setWallet] = useState("");
    const [amount, setAmount] = useState("5");
    const [status, setStatus] = useState(null); // { type: 'success'|'error'|'loading', message }
    const [balance, setBalance] = useState(null);
    const [balanceWallet, setBalanceWallet] = useState("");
    const [checkingBalance, setCheckingBalance] = useState(false);

    const handleMint = async () => {
        if (!wallet.trim()) return setStatus({ type: "error", message: "Enter a wallet address." });
        setStatus({ type: "loading", message: `Sending ${amount} test USDT to ${wallet.slice(0, 8)}...` });
        try {
            const res = await fetch(`${API_URL}/api/devnet/faucet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: wallet.trim(), amount: Number(amount) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Faucet failed");
            setStatus({ type: "success", message: data.message || `${amount} USDT sent successfully!` });
            setWallet("");
        } catch (err) {
            setStatus({ type: "error", message: err.message });
        }
    };

    const handleCheckBalance = async () => {
        if (!balanceWallet.trim()) return;
        setCheckingBalance(true);
        setBalance(null);
        try {
            const res = await fetch(`${API_URL}/api/devnet/usdt-balance?wallet=${balanceWallet.trim()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch balance");
            setBalance(data.balance);
        } catch (err) {
            setBalance(`Error: ${err.message}`);
        } finally {
            setCheckingBalance(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0B0F1B",
            backgroundImage: "radial-gradient(ellipse 80% 40% at 50% 0%, #C19A4A1A 0%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "'Courier New', monospace",
        }}>
            <div style={{ width: "100%", maxWidth: "480px" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{
                        display: "inline-block",
                        background: "linear-gradient(135deg, #C19A4A22, #C19A4A08)",
                        border: "1px solid #C19A4A44",
                        borderRadius: "12px",
                        padding: "10px 18px",
                        marginBottom: "1.2rem",
                        fontSize: "11px",
                        letterSpacing: "3px",
                        color: "#C19A4A",
                        textTransform: "uppercase",
                    }}>
                        ⬡ DEVNET ONLY
                    </div>
                    <h1 style={{
                        fontSize: "2rem",
                        fontWeight: "800",
                        color: "#fff",
                        margin: "0 0 0.5rem",
                        letterSpacing: "-1px",
                    }}>
                        USDT <span style={{ color: "#C19A4A" }}>Faucet</span>
                    </h1>
                    <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
                        Mint test USDT to any devnet wallet
                    </p>
                    <p style={{
                        marginTop: "8px",
                        fontSize: "10px",
                        color: "#444",
                        letterSpacing: "1px",
                        fontFamily: "monospace",
                    }}>
                        MINT: {USDT_MINT.slice(0, 8)}...{USDT_MINT.slice(-6)}
                    </p>
                </div>

                {/* Mint Card */}
                <div style={{
                    background: "linear-gradient(135deg, #111625, #0d1020)",
                    border: "1px solid #C19A4A33",
                    borderRadius: "20px",
                    padding: "2rem",
                    marginBottom: "1.5rem",
                    boxShadow: "0 0 60px #C19A4A0A",
                }}>
                    <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", color: "#C19A4A", marginBottom: "8px", textTransform: "uppercase" }}>
                        Recipient Wallet
                    </label>
                    <input
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        placeholder="Solana wallet address..."
                        style={{
                            width: "100%",
                            background: "#0B0F1B",
                            border: "1px solid #ffffff18",
                            borderRadius: "10px",
                            padding: "12px 14px",
                            color: "#fff",
                            fontSize: "13px",
                            fontFamily: "monospace",
                            outline: "none",
                            marginBottom: "1.2rem",
                            boxSizing: "border-box",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#C19A4A66"}
                        onBlur={(e) => e.target.style.borderColor = "#ffffff18"}
                    />

                    <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", color: "#C19A4A", marginBottom: "8px", textTransform: "uppercase" }}>
                        Amount (USDT)
                    </label>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
                        {["1", "5", "10", "50"].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: amount === val ? "1px solid #C19A4A" : "1px solid #ffffff15",
                                    background: amount === val ? "#C19A4A22" : "transparent",
                                    color: amount === val ? "#C19A4A" : "#666",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontFamily: "monospace",
                                    fontWeight: amount === val ? "700" : "400",
                                    transition: "all 0.15s",
                                }}
                            >
                                {val}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleMint}
                        disabled={status?.type === "loading"}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: status?.type === "loading"
                                ? "#333"
                                : "linear-gradient(135deg, #C19A4A, #d9b563)",
                            border: "none",
                            borderRadius: "12px",
                            color: status?.type === "loading" ? "#666" : "#0B0F1B",
                            fontWeight: "800",
                            fontSize: "14px",
                            letterSpacing: "1px",
                            cursor: status?.type === "loading" ? "not-allowed" : "pointer",
                            fontFamily: "monospace",
                            textTransform: "uppercase",
                            transition: "all 0.2s",
                        }}
                    >
                        {status?.type === "loading" ? "⟳ Sending..." : `→ Send ${amount} USDT`}
                    </button>

                    {/* Status message */}
                    {status && status.type !== "loading" && (
                        <div style={{
                            marginTop: "1rem",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            background: status.type === "success" ? "#22c55e18" : "#ef444418",
                            border: `1px solid ${status.type === "success" ? "#22c55e44" : "#ef444444"}`,
                            color: status.type === "success" ? "#22c55e" : "#ef4444",
                            fontSize: "12px",
                            fontFamily: "monospace",
                        }}>
                            {status.type === "success" ? "✓ " : "✗ "}{status.message}
                        </div>
                    )}
                </div>

                {/* Balance Check Card */}
                <div style={{
                    background: "linear-gradient(135deg, #111625, #0d1020)",
                    border: "1px solid #ffffff0d",
                    borderRadius: "20px",
                    padding: "1.5rem 2rem",
                }}>
                    <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", color: "#555", marginBottom: "8px", textTransform: "uppercase" }}>
                        Check USDT Balance
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input
                            value={balanceWallet}
                            onChange={(e) => setBalanceWallet(e.target.value)}
                            placeholder="Any wallet address..."
                            style={{
                                flex: 1,
                                background: "#0B0F1B",
                                border: "1px solid #ffffff18",
                                borderRadius: "10px",
                                padding: "11px 14px",
                                color: "#fff",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#ffffff33"}
                            onBlur={(e) => e.target.style.borderColor = "#ffffff18"}
                            onKeyDown={(e) => e.key === "Enter" && handleCheckBalance()}
                        />
                        <button
                            onClick={handleCheckBalance}
                            disabled={checkingBalance}
                            style={{
                                padding: "11px 18px",
                                background: "#ffffff08",
                                border: "1px solid #ffffff15",
                                borderRadius: "10px",
                                color: "#aaa",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {checkingBalance ? "..." : "Check"}
                        </button>
                    </div>

                    {balance !== null && (
                        <div style={{
                            marginTop: "1rem",
                            padding: "14px",
                            borderRadius: "10px",
                            background: "#0B0F1B",
                            border: "1px solid #C19A4A22",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                            <span style={{ fontSize: "11px", color: "#555", letterSpacing: "1px", textTransform: "uppercase" }}>Balance</span>
                            <span style={{ fontSize: "20px", fontWeight: "800", color: "#C19A4A", fontFamily: "monospace" }}>
                                {typeof balance === "number" ? `${balance} USDT` : balance}
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}