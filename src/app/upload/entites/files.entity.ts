import { SubTask } from 'src/app/task/entities/subtask.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('files')
export class File extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    originalName: string;

    @Column({ type: 'varchar', length: 500 })
    filePath: string; // URL or path to the file (e.g., S3 URL or local path)

    @Column({ type: 'varchar', length: 100 })
    mimeType: string; // MIME type (e.g., 'application/pdf', 'image/png')

    @Column({ type: 'bigint' })
    size: number; // File size in bytes

    @Column()
    subTaskId: number; 

    @ManyToOne(() => SubTask, (subTask) => subTask.files, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subTaskId' })
    subTask: SubTask; // Optional relation to SubTask
}