"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Supabase クライアント（クライアント環境では NEXT_PUBLIC_ プレフィックスを使用）
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        async function loadQuizzes() {
            setLoading(true);
            setError(null);
            try {
                // キャラクターに関連するゲームと声優の名前をネストで取得（小文字テーブル名）
                const { data, error: sbError } = await supabase
                    .from("character")
                    .select("name, game:game_id(title), actor:actor_id(name)")
                    .order("name", { ascending: true });

                if (sbError) {
                    setError(sbError.message);
                    setQuizzes([]);
                } else if (data) {
                    setQuizzes(data);
                }
            } catch (e) {
                setError(String(e));
                setQuizzes([]);
            } finally {
                setLoading(false);
            }
        }

        loadQuizzes();
    }, []);

    const filteredQuizzes = quizzes;

    const toggleQuiz = (quizId) => {
        setExpanded((prev) => ({ ...prev, [quizId]: !prev[quizId] }));
    };

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">キャラクター一覧</h2>
            </div>

            {/* ローディング・エラー表示 */}
            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">読み込み中…</p>
                </div>
            ) : error ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <p className="text-red-600">エラー: {error}</p>
                </div>
            ) : filteredQuizzes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        クイズがありません
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        新しいクイズを追加して始めましょう。
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            クイズを追加
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredQuizzes.map((quiz) => (
                        <Link
                            key={quiz.name}
                            href={`/character/${encodeURIComponent(quiz.name)}`}
                            className="block"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                                <div className="p-6">
                                    <div className="mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                            {quiz?.game?.title || "(ゲーム未登録)"}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 whitespace-pre-wrap hover:text-blue-800 dark:hover:text-blue-300">
                                        {quiz.name}
                                    </h3>

                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                            </svg>
                                            <strong>ゲーム:</strong> {quiz?.game?.title || "(未登録)"}
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <strong>声優:</strong> {quiz?.actor?.name || "(未登録)"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
