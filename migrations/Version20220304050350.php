<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220304050350 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE ext_log_entries (id INT AUTO_INCREMENT NOT NULL, action VARCHAR(8) NOT NULL, logged_at DATETIME NOT NULL, object_id VARCHAR(64) DEFAULT NULL, object_class VARCHAR(191) NOT NULL, version INT NOT NULL, data LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:array)\', username VARCHAR(191) DEFAULT NULL, INDEX log_class_lookup_idx (object_class), INDEX log_date_lookup_idx (logged_at), INDEX log_user_lookup_idx (username), INDEX log_version_lookup_idx (object_id, object_class, version), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB ROW_FORMAT = DYNAMIC');
        $this->addSql('CREATE TABLE ext_translations (id INT AUTO_INCREMENT NOT NULL, locale VARCHAR(8) NOT NULL, object_class VARCHAR(191) NOT NULL, field VARCHAR(32) NOT NULL, foreign_key VARCHAR(64) NOT NULL, content LONGTEXT DEFAULT NULL, INDEX translations_lookup_idx (locale, object_class, foreign_key), UNIQUE INDEX lookup_unique_idx (locale, object_class, field, foreign_key), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB ROW_FORMAT = DYNAMIC');
        $this->addSql('CREATE TABLE library_answer (id INT AUTO_INCREMENT NOT NULL, testing_id INT DEFAULT NULL, is_true TINYINT(1) NOT NULL, text LONGTEXT NOT NULL, image VARCHAR(255) DEFAULT NULL, current_version INT NOT NULL, deleted_at DATETIME DEFAULT NULL, INDEX IDX_713FD2AE62CAF12 (testing_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE revisions (id INT AUTO_INCREMENT NOT NULL, timestamp DATETIME NOT NULL, username VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_answer_audit (id INT NOT NULL, rev INT NOT NULL, testing_id INT DEFAULT NULL, is_true TINYINT(1) DEFAULT NULL, text LONGTEXT DEFAULT NULL, image VARCHAR(255) DEFAULT NULL, current_version INT DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, revtype VARCHAR(4) NOT NULL, INDEX rev_98f79185761811f19463c99369b1cab5_idx (rev), PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_exercise (id INT AUTO_INCREMENT NOT NULL, library_item_id INT DEFAULT NULL, position INT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME NOT NULL, deleted_at DATETIME DEFAULT NULL, question LONGTEXT DEFAULT NULL, options JSON NOT NULL, type VARCHAR(255) NOT NULL, current_version INT NOT NULL, INDEX IDX_8879240868AEEA6E (library_item_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_exercise_audit (id INT NOT NULL, rev INT NOT NULL, library_item_id INT DEFAULT NULL, position INT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, question LONGTEXT DEFAULT NULL, options JSON DEFAULT NULL, type VARCHAR(255) DEFAULT NULL, current_version INT DEFAULT NULL, revtype VARCHAR(4) NOT NULL, INDEX rev_2f37cc06c56aba6e5a65c07894ebfec2_idx (rev), PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_item (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, rate INT NOT NULL, json JSON NOT NULL, required TINYINT(1) NOT NULL, current_version INT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME NOT NULL, deleted_at DATETIME DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_item_audit (id INT NOT NULL, rev INT NOT NULL, title VARCHAR(255) DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, rate INT DEFAULT NULL, json JSON DEFAULT NULL, required TINYINT(1) DEFAULT NULL, current_version INT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, revtype VARCHAR(4) NOT NULL, INDEX rev_4221806422b06c8fe9fd7f09410a369a_idx (rev), PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_lesson (id INT AUTO_INCREMENT NOT NULL, library_item_id INT NOT NULL, body LONGTEXT NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME NOT NULL, deleted_at DATETIME DEFAULT NULL, current_version INT NOT NULL, UNIQUE INDEX UNIQ_5396EC7868AEEA6E (library_item_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_lesson_audit (id INT NOT NULL, rev INT NOT NULL, library_item_id INT DEFAULT NULL, body LONGTEXT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, current_version INT DEFAULT NULL, revtype VARCHAR(4) NOT NULL, INDEX rev_f045ee490d03e5d50063915c672d6c1d_idx (rev), PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_testing (id INT AUTO_INCREMENT NOT NULL, library_exercise_id INT DEFAULT NULL, question LONGTEXT NOT NULL, current_version INT NOT NULL, deleted_at DATETIME DEFAULT NULL, INDEX IDX_9232E236B063BC3E (library_exercise_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE library_testing_audit (id INT NOT NULL, rev INT NOT NULL, library_exercise_id INT DEFAULT NULL, question LONGTEXT DEFAULT NULL, current_version INT DEFAULT NULL, deleted_at DATETIME DEFAULT NULL, revtype VARCHAR(4) NOT NULL, INDEX rev_2c7959a64b62dcb598612e3d937919a4_idx (rev), PRIMARY KEY(id, rev)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, middle_name VARCHAR(255) DEFAULT NULL, last_name VARCHAR(255) DEFAULT NULL, is_active TINYINT(1) NOT NULL, last_locale VARCHAR(255) DEFAULT NULL, remember_token VARCHAR(255) DEFAULT NULL, image VARCHAR(1000) DEFAULT NULL, last_login DATETIME DEFAULT NULL, email VARCHAR(255) NOT NULL, open_password VARCHAR(255) NOT NULL, date_of_disconnection DATE DEFAULT NULL, phone VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_8D93D649F85E0677 (username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE library_answer ADD CONSTRAINT FK_713FD2AE62CAF12 FOREIGN KEY (testing_id) REFERENCES library_testing (id)');
        $this->addSql('ALTER TABLE library_answer_audit ADD CONSTRAINT rev_98f79185761811f19463c99369b1cab5_fk FOREIGN KEY (rev) REFERENCES revisions (id)');
        $this->addSql('ALTER TABLE library_exercise ADD CONSTRAINT FK_8879240868AEEA6E FOREIGN KEY (library_item_id) REFERENCES library_item (id)');
        $this->addSql('ALTER TABLE library_exercise_audit ADD CONSTRAINT rev_2f37cc06c56aba6e5a65c07894ebfec2_fk FOREIGN KEY (rev) REFERENCES revisions (id)');
        $this->addSql('ALTER TABLE library_item_audit ADD CONSTRAINT rev_4221806422b06c8fe9fd7f09410a369a_fk FOREIGN KEY (rev) REFERENCES revisions (id)');
        $this->addSql('ALTER TABLE library_lesson ADD CONSTRAINT FK_5396EC7868AEEA6E FOREIGN KEY (library_item_id) REFERENCES library_item (id)');
        $this->addSql('ALTER TABLE library_lesson_audit ADD CONSTRAINT rev_f045ee490d03e5d50063915c672d6c1d_fk FOREIGN KEY (rev) REFERENCES revisions (id)');
        $this->addSql('ALTER TABLE library_testing ADD CONSTRAINT FK_9232E236B063BC3E FOREIGN KEY (library_exercise_id) REFERENCES library_exercise (id)');
        $this->addSql('ALTER TABLE library_testing_audit ADD CONSTRAINT rev_2c7959a64b62dcb598612e3d937919a4_fk FOREIGN KEY (rev) REFERENCES revisions (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE library_answer_audit DROP FOREIGN KEY rev_98f79185761811f19463c99369b1cab5_fk');
        $this->addSql('ALTER TABLE library_exercise_audit DROP FOREIGN KEY rev_2f37cc06c56aba6e5a65c07894ebfec2_fk');
        $this->addSql('ALTER TABLE library_item_audit DROP FOREIGN KEY rev_4221806422b06c8fe9fd7f09410a369a_fk');
        $this->addSql('ALTER TABLE library_lesson_audit DROP FOREIGN KEY rev_f045ee490d03e5d50063915c672d6c1d_fk');
        $this->addSql('ALTER TABLE library_testing_audit DROP FOREIGN KEY rev_2c7959a64b62dcb598612e3d937919a4_fk');
        $this->addSql('ALTER TABLE library_testing DROP FOREIGN KEY FK_9232E236B063BC3E');
        $this->addSql('ALTER TABLE library_exercise DROP FOREIGN KEY FK_8879240868AEEA6E');
        $this->addSql('ALTER TABLE library_lesson DROP FOREIGN KEY FK_5396EC7868AEEA6E');
        $this->addSql('ALTER TABLE library_answer DROP FOREIGN KEY FK_713FD2AE62CAF12');
        $this->addSql('DROP TABLE ext_log_entries');
        $this->addSql('DROP TABLE ext_translations');
        $this->addSql('DROP TABLE library_answer');
        $this->addSql('DROP TABLE revisions');
        $this->addSql('DROP TABLE library_answer_audit');
        $this->addSql('DROP TABLE library_exercise');
        $this->addSql('DROP TABLE library_exercise_audit');
        $this->addSql('DROP TABLE library_item');
        $this->addSql('DROP TABLE library_item_audit');
        $this->addSql('DROP TABLE library_lesson');
        $this->addSql('DROP TABLE library_lesson_audit');
        $this->addSql('DROP TABLE library_testing');
        $this->addSql('DROP TABLE library_testing_audit');
        $this->addSql('DROP TABLE user');
    }
}
