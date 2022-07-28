<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220728051011 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments ADD reply_comment_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962AF2A47145 FOREIGN KEY (reply_comment_id) REFERENCES comments (id)');
        $this->addSql('CREATE INDEX IDX_5F9E962AF2A47145 ON comments (reply_comment_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962AF2A47145');
        $this->addSql('DROP INDEX IDX_5F9E962AF2A47145 ON comments');
        $this->addSql('ALTER TABLE comments DROP reply_comment_id');
    }
}
