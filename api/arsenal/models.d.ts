export interface IArsenal {
    id: string;
    owner: string;
    question_schema: string;
    answers?: IArsenalAnswer;
}

export interface IArsenalAnswer {
    id: string;
    answer: string;
}
