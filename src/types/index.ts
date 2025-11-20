export interface Category {
    id: string;
    slug: string;
    title_it: string;
    title_en?: string;
    icon_name?: string;
    order_index: number;
}

export interface Question {
    id: string;
    category_id: string;
    image_url?: string;
    question_text_it: string;
    explanation_it?: string;
    options_it: string[];
    correct_option_index: number;
    difficulty_level: number;
}

export interface UserProgress {
    id: string;
    user_id: string;
    question_id: string;
    status: 'correct' | 'incorrect' | 'flagged';
    next_review_at?: string;
}

export interface Profile {
    id: string;
    username?: string;
    avatar_url?: string;
    native_language: string;
    xp: number;
    hearts: number;
    streak: number;
}
