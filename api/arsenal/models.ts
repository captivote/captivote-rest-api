import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

export const _dependencies = ['user'];

export abstract class Timer {
    @Column({ type: 'int', nullable: true })
    timer?: number;
}

@Entity('arsenal_tbl')
export class Arsenal extends Timer {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'jsonb' })
    question_schema: string;

    @OneToMany(type => ArsenalAnswer, arsenal_answer => arsenal_answer.arsenal)
    answers: ArsenalAnswer[];

    @Column({ type: 'varchar' })
    owner: string;
}

@Entity('arsenal_answer_tbl')
export class ArsenalAnswer extends Timer {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @ManyToOne(type => Arsenal, arsenal => arsenal.answers)
    arsenal: Arsenal;

    @Column({ type: 'jsonb' })
    answer: string;
}
