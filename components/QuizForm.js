"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function QuizForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [games, setGames] = useState([]);
    const [actors, setActors] = useState([]);
    const [voiceTable, setVoiceTable] = useState("voice_actor"); // 実際のテーブル名を検出して設定

    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        game_id: "",
           actor_id: "",
           new_game: "",
           new_voice_actor: "",
           game_mode: "existing",
           actor_mode: "existing",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === "game_mode") {
                if (value === "existing") {
                    next.new_game = "";
                } else {
                    next.game_id = "";
                }
            }
            if (name === "actor_mode") {
                if (value === "existing") {
                    next.new_voice_actor = "";
                } else {
                    next.actor_id = "";
                }
            }
            return next;
        });
    };

    const formatError = (err) => {
        if (!err) return "";
        if (typeof err === "string") return err;
        if (err.message) return err.message;
        try {
            return JSON.stringify(err);
        } catch (e) {
            return String(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // ゲームID を決定
            let selectedGameId = null;
            if (formData.game_mode === "existing") {
                selectedGameId = formData.game_id ? Number(formData.game_id) : null;
            } else if (formData.game_mode === "new" && formData.new_game && formData.new_game.trim() !== "") {
                const title = formData.new_game.trim();
                const { data: existingGames, error: gErr } = await supabase.from("game").select("id").eq("title", title);
                if (gErr) throw gErr;
                if (existingGames && existingGames.length > 0) {
                    selectedGameId = existingGames[0].id;
                } else {
                    // 最大IDを取得して次のIDを決定
                    const { data: maxIdData, error: maxErr } = await supabase.from("game").select("id").order("id", { ascending: false }).limit(1);
                    if (maxErr && maxErr.code !== "PGRST116") throw maxErr; // テーブル空の場合はエラーを無視
                    const nextId = (maxIdData && maxIdData.length > 0) ? maxIdData[0].id + 1 : 1;
                    
                    const { data: insertedGame, error: insErr } = await supabase.from("game").insert([{ id: nextId, title }]).select("id");
                    if (insErr) throw insErr;
                    if (insertedGame && insertedGame.length > 0) {
                        selectedGameId = insertedGame[0].id;
                    } else {
                        throw new Error("ゲーム挿入後、IDを取得できませんでした。");
                    }
                }
            }

            // 声優ID を決定
            let selectedVoiceActorId = null;
            if (formData.actor_mode === "existing") {
                selectedVoiceActorId = formData.actor_id ? Number(formData.actor_id) : null;
            } else if (formData.actor_mode === "new" && formData.new_voice_actor && formData.new_voice_actor.trim() !== "") {
                const name = formData.new_voice_actor.trim();
                // voiceTable を使って試行。失敗した場合は別名のテーブルでフォールバックする
                const tryTables = ["actor", "voice_actor"];
                let found = false;
                const errors = [];
                for (const tbl of tryTables) {
                    try {
                        const { data: existingVAs, error: vErr } = await supabase.from(tbl).select("id").eq("name", name).limit(1);
                        if (vErr) {
                            errors.push({ table: tbl, error: vErr });
                            continue;
                        }
                        if (existingVAs && existingVAs.length > 0) {
                            selectedVoiceActorId = existingVAs[0].id;
                            setVoiceTable(tbl);
                            found = true;
                            break;
                        }
                        // 最大IDを取得して次のIDを決定
                        const { data: maxIdData, error: maxErr } = await supabase.from(tbl).select("id").order("id", { ascending: false }).limit(1);
                        if (maxErr && maxErr.code !== "PGRST116") {
                            errors.push({ table: tbl, error: maxErr });
                            continue;
                        }
                        const nextId = (maxIdData && maxIdData.length > 0) ? maxIdData[0].id + 1 : 1;
                        
                        const { data: insertedVA, error: insVErr } = await supabase.from(tbl).insert([{ id: nextId, name }]).select("id");
                        if (insVErr) {
                            errors.push({ table: tbl, error: insVErr });
                            continue;
                        }
                        if (insertedVA && insertedVA.length > 0) {
                            selectedVoiceActorId = insertedVA[0].id;
                        } else {
                            errors.push({ table: tbl, error: "声優挿入後、IDを取得できませんでした。" });
                            continue;
                        }
                        setVoiceTable(tbl);
                        found = true;
                        break;
                    } catch (e) {
                        errors.push({ table: tbl, error: e });
                        continue;
                    }
                }
                if (!found) {
                    const msgs = errors.map((x) => `${x.table}: ${formatError(x.error)}`).join(" | ");
                    throw new Error(`声優テーブルが見つからないか、レコードを作成できませんでした。詳細: ${msgs}`);
                }
            }

            // Character を作成
            const payload = {
                name: formData.name,
                game_id: selectedGameId,
                actor_id: selectedVoiceActorId,
            };

            const { data, error: sbError } = await supabase.from("character").insert([payload]).select();

            if (sbError) {
                setError(formatError(sbError));
            } else {
                setSuccess("キャラクターを保存しました。");
                setFormData({ name: "", game_id: "", actor_id: "", new_game: "", new_voice_actor: "", game_mode: "existing", actor_mode: "existing" });
            }
        } catch (err) {
            setError(formatError(err));
        } finally {
            setLoading(false);
        }
    };

    // 初期ロードで Games と Actors を取得
    useEffect(() => {
        async function loadLists() {
            try {
                const { data: gdata } = await supabase.from("game").select("id, title").order("title", { ascending: true });

                // まず `actor` テーブルを試す（多くのDBではこちら）。失敗したら `voice_actor` を試行してフォールバックする。
                let table = "actor";
                let adata = null;
                try {
                    const res = await supabase.from(table).select("id, name").order("name", { ascending: true }).limit(100);
                    if (!res.error) {
                        adata = res.data || [];
                    } else {
                        throw res.error;
                    }
                } catch (e) {
                    // フォールバック: 'voice_actor' を試す
                    table = "voice_actor";
                    try {
                        const res2 = await supabase.from(table).select("id, name").order("name", { ascending: true }).limit(100);
                        if (!res2.error) {
                            adata = res2.data || [];
                        } else {
                            throw res2.error;
                        }
                    } catch (e2) {
                        // 両方失敗したら空配列で続行
                        adata = [];
                    }
                }

                setGames(gdata || []);
                setActors(adata || []);
                setVoiceTable(table);
            } catch (e) {
                // ignore silently
            }
        }

        loadLists();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* エラー・成功メッセージ */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    エラー
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-green-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                    成功
                                </h3>
                                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                    {success}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* キャラクター名 */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        キャラクター名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
                        placeholder="キャラクター名を入力してください"
                    />
                </div>

                {/* ゲーム: 既存選択か新規追加を切り替え */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ゲーム</label>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="inline-flex items-center text-sm">
                            <input
                                type="radio"
                                name="game_mode"
                                value="existing"
                                checked={formData.game_mode === "existing"}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            既存から選択
                        </label>
                        <label className="inline-flex items-center text-sm">
                            <input
                                type="radio"
                                name="game_mode"
                                value="new"
                                checked={formData.game_mode === "new"}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            新しく追加
                        </label>
                    </div>

                    {formData.game_mode === "existing" ? (
                        <select
                            id="game_id"
                            name="game_id"
                            value={formData.game_id}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
                        >
                            <option value="">-- 未選択 --</option>
                            {games.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.title}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id="new_game"
                            name="new_game"
                            type="text"
                            value={formData.new_game}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
                            placeholder="例: My Game Title"
                        />
                    )}
                </div>

                {/* 声優: 既存選択か新規追加を切り替え */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">声優</label>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="inline-flex items-center text-sm">
                            <input
                                type="radio"
                                name="actor_mode"
                                value="existing"
                                checked={formData.actor_mode === "existing"}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            既存から選択
                        </label>
                        <label className="inline-flex items-center text-sm">
                            <input
                                type="radio"
                                name="actor_mode"
                                value="new"
                                checked={formData.actor_mode === "new"}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            新しく追加
                        </label>
                    </div>

                    {formData.actor_mode === "existing" ? (
                        <select
                            id="actor_id"
                            name="actor_id"
                            value={formData.actor_id}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
                        >
                            <option value="">-- 未選択 --</option>
                            {actors.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id="new_voice_actor"
                            name="new_voice_actor"
                            type="text"
                            value={formData.new_voice_actor}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
                            placeholder="例: Yamada Taro"
                        />
                    )}
                </div>

                {/* 送信ボタン */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                作成中...
                            </div>
                        ) : (
                            "クイズを作成"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
