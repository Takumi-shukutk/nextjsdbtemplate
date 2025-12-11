"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function CharacterDetail() {
    const params = useParams();
    const characterName = decodeURIComponent(params.name);
    
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCharacter() {
            setLoading(true);
            setError(null);
            try {
                // キャラクターの詳細情報を取得（ゲーム名と声優名を含む）
                const { data, error: sbError } = await supabase
                    .from("character")
                    .select("name, image, game:game_id(id, title), actor:actor_id(id, name)")
                    .eq("name", characterName)
                    .single();

                if (sbError) {
                    setError(sbError.message);
                    setCharacter(null);
                } else if (data) {
                    setCharacter(data);
                } else {
                    setError("キャラクターが見つかりません");
                    setCharacter(null);
                }
            } catch (e) {
                setError(String(e));
                setCharacter(null);
            } finally {
                setLoading(false);
            }
        }

        loadCharacter();
    }, [characterName]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* ヘッダー */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                キャラクター詳細
                            </h1>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link
                                href="/"
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            >
                                ホーム
                            </Link>
                            <Link
                                href="/create"
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            >
                                キャラを追加
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-8"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    戻る
                </Link>

                {/* ローディング・エラー表示 */}
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">読み込み中…</p>
                    </div>
                ) : error ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                        <p className="text-red-600 dark:text-red-400">エラー: {error}</p>
                    </div>
                ) : character ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        {/* 画像表示 */}
                        {character.image && (
                            <div className="mb-8">
                                <img
                                    src={character.image}
                                    alt={character.name}
                                    className="w-full h-auto rounded-lg object-cover max-h-96"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            </div>
                        )}

                        {/* キャラクター名 */}
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {character.name}
                            </h2>
                            <div className="h-1 w-20 bg-blue-500 rounded"></div>
                        </div>

                        {/* ゲーム情報 */}
                        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                ゲーム
                            </h3>
                            {character.game ? (
                                <div className="flex items-start">
                                    <svg
                                        className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                    </svg>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {character.game.title}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">未設定</p>
                            )}
                        </div>

                        {/* 声優情報 */}
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                                声優
                            </h3>
                            {character.actor ? (
                                <div className="flex items-start">
                                    <svg
                                        className="w-6 h-6 text-purple-500 mr-3 mt-1 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {character.actor.name}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">未設定</p>
                            )}
                        </div>

                        {/* アクションボタン */}
                        <div className="flex space-x-4 mt-8">
                            <Link
                                href="/"
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                一覧に戻る
                            </Link>
                        </div>
                    </div>
                ) : null}
            </main>

            {/* フッター */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        © 2024 キャラクター管理アプリ
                    </p>
                </div>
            </footer>
        </div>
    );
}
