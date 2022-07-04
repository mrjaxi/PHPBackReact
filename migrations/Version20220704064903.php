<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220704064903 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments ADD is_checked TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE ideas ADD official_comment_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE ideas ADD CONSTRAINT FK_1DB2F1DE54179331 FOREIGN KEY (official_comment_id) REFERENCES comments (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1DB2F1DE54179331 ON ideas (official_comment_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments DROP is_checked');
        $this->addSql('ALTER TABLE ideas DROP FOREIGN KEY FK_1DB2F1DE54179331');
        $this->addSql('DROP INDEX UNIQ_1DB2F1DE54179331 ON ideas');
        $this->addSql('ALTER TABLE ideas DROP official_comment_id');
    }
}
