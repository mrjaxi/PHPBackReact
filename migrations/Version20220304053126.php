<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220304053126 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE branch (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE position (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `system` (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, branch_id INT DEFAULT NULL, position_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, count_staff INT DEFAULT NULL, count_user INT DEFAULT NULL, experience_lms VARCHAR(255) DEFAULT NULL, INDEX IDX_C94D118BA76ED395 (user_id), INDEX IDX_C94D118BDCD6CC49 (branch_id), INDEX IDX_C94D118BDD842E46 (position_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE `system` ADD CONSTRAINT FK_C94D118BA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE `system` ADD CONSTRAINT FK_C94D118BDCD6CC49 FOREIGN KEY (branch_id) REFERENCES branch (id)');
        $this->addSql('ALTER TABLE `system` ADD CONSTRAINT FK_C94D118BDD842E46 FOREIGN KEY (position_id) REFERENCES position (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `system` DROP FOREIGN KEY FK_C94D118BDCD6CC49');
        $this->addSql('ALTER TABLE `system` DROP FOREIGN KEY FK_C94D118BDD842E46');
        $this->addSql('DROP TABLE branch');
        $this->addSql('DROP TABLE position');
        $this->addSql('DROP TABLE `system`');
    }
}
