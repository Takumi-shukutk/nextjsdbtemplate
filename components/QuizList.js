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
    const [selectedCategory, setSelectedCategory] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        async function loadQuizzes() {
            setLoading(true);
            setError(null);
            try {
                const { data, error: sbError } = await supabase
                    .from("question")
                    .select("id, question_text, answer, category")
                    .order("id", { ascending: true });

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

    // カテゴリフィルタリング
    const filteredQuizzes = selectedCategory
        ? quizzes.filter((quiz) => quiz.category === selectedCategory)
        : quizzes;

    const toggleQuiz = (quizId) => {
        setExpanded((prev) => ({ ...prev, [quizId]: !prev[quizId] }));
    };

    return (
        <div>
            {/* フィルター */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            カテゴリ
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">すべて</option>
                            <option value="英語">英語</option>
                            <option value="数学">数学</option>
                            <option value="国語">国語</option>
                            <option value="理科">理科</option>
                            <option value="社会">社会</option>
                        </select>
                    </div>
                </div>
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
                        <div
                            key={quiz.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="mb-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                        {quiz.category}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">
                                    {quiz.question_text}
                                </h3>

                                <button
                                    onClick={() => toggleQuiz(quiz.id)}
                                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    回答を見る
                                </button>

                                {expanded[quiz.id] && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
                                        <div className="flex items-center mb-2">
                                            <svg
                                                className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                正解
                                            </span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {quiz.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
