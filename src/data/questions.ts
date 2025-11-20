import type { Question } from '../types';

export const MOCK_QUESTIONS: Question[] = [
    {
        id: 'q1',
        category_id: '1',
        question_text_it: 'Il segnale raffigurato indica un divieto di sosta?',
        explanation_it: 'No, questo segnale indica un divieto di fermata, che è più restrittivo.',
        options_it: ['Vero', 'Falso'],
        correct_option_index: 1,
        difficulty_level: 1,
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Italian_traffic_signs_-_divieto_di_fermata.svg/1200px-Italian_traffic_signs_-_divieto_di_fermata.svg.png'
    },
    {
        id: 'q2',
        category_id: '1',
        question_text_it: 'Il segnale raffigurato preannuncia una curva pericolosa a destra?',
        explanation_it: 'Sì, questo è il segnale di curva pericolosa a destra.',
        options_it: ['Vero', 'Falso'],
        correct_option_index: 0,
        difficulty_level: 1,
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Italian_traffic_signs_-_curva_pericolosa_a_destra.svg/600px-Italian_traffic_signs_-_curva_pericolosa_a_destra.svg.png'
    }
];
