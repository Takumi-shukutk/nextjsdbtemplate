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

    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        game_id: "",
           actor_id: "",
           new_game: "",
           new_voice_actor: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Character を作成 (小文字テーブル/カラム)
            const payload = {
                name: formData.name,
                    game_id: selectedGameId,
                    voice_actor_id: selectedVoiceActorId,
            };

            const { data, error: sbError } = await supabase
                .from("character")
                .insert([payload])
                .select();
                // ゲームの選択 or 新規作成（同名があれば既存を使う）
                let selectedGameId = formData.game_id ? Number(formData.game_id) : null;
                if (formData.new_game && formData.new_game.trim() !== "") {
                    const title = formData.new_game.trim();
                    const { data: existingGames, error: gErr } = await supabase.from("game").select("id").eq("title", title).limit(1);
                    if (gErr) throw gErr;
                    if (existingGames && existingGames.length > 0) {
                        selectedGameId = existingGames[0].id;
                    } else {
                        const { data: insertedGame, error: insErr } = await supabase.from("game").insert({ title }).select("id").limit(1);
                        if (insErr) throw insErr;
                        selectedGameId = insertedGame[0].id;
                    }
                }

                // 声優の選択 or 新規作成（同名があれば既存を使う）
                let selectedVoiceActorId = formData.actor_id ? Number(formData.actor_id) : null;
                if (formData.new_voice_actor && formData.new_voice_actor.trim() !== "") {
                    const name = formData.new_voice_actor.trim();
                    const { data: existingVAs, error: vErr } = await supabase.from("voice_actor").select("id").eq("name", name).limit(1);
                    if (vErr) throw vErr;
                    if (existingVAs && existingVAs.length > 0) {
                        selectedVoiceActorId = existingVAs[0].id;
                    } else {
                        const { data: insertedVA, error: insVErr } = await supabase.from("voice_actor").insert({ name }).select("id").limit(1);
                        if (insVErr) throw insVErr;
                        selectedVoiceActorId = insertedVA[0].id;
                    }
                }

            if (sbError) {
                setError(sbError.message);
            } else {
                setSuccess("キャラクターを保存しました。");
                setFormData({ name: "", game_id: "", actor_id: "" });
            }
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    // 初期ロードで Games と Actors を取得
    useEffect(() => {
        async function loadLists() {
            try {
                const { data: gdata } = await supabase.from("game").select("id, title").order("title", { ascending: true });
                const { data: adata } = await supabase.from("actor").select("id, name").order("name", { ascending: true });
                setGames(gdata || []);
                setActors(adata || []);
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

                {/* ゲーム選択 */}
                <div>
                    <label htmlFor="game_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ゲーム
                    </label>
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
                </div>

                {/* 新しいゲームを追加（既存名があれば再利用） */}
                <div>
                    <label htmlFor="new_game" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        新しいゲーム名（既存と同名なら既存を使用）
                    </label>
                    <input
                        id="new_game"
                        name="new_game"
                        type="text"
                        value={formData.new_game}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
                        placeholder="例: My Game Title"
                    />
                </div>

                {/* 声優選択 */}
                <div>
                    <label htmlFor="actor_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        声優
                    </label>
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
                </div>

                {/* 新しい声優を追加（既存名があれば再利用） */}
                <div>
                    <label htmlFor="new_voice_actor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        新しい声優名（既存と同名なら既存を使用）
                    </label>
                    <input
                        id="new_voice_actor"
                        name="new_voice_actor"
                        type="text"
                        value={formData.new_voice_actor}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-black"
                        placeholder="例: Yamada Taro"
                    />
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
