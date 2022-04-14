<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220413073728 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `system` DROP FOREIGN KEY FK_C94D118BDCD6CC49');
        $this->addSql('ALTER TABLE `system` DROP FOREIGN KEY FK_C94D118BDD842E46');
        $this->addSql('ALTER TABLE `system` ADD CONSTRAINT FK_C94D118BDCD6CC49 FOREIGN KEY (branch_id) REFERENCES branch (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE `system` ADD CONSTRAINT FK_C94D118BDD842E46 FOREIGN KEY (position_id) REFERENCES position (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `system` DROP FOREIGN KEY FK_C94D118BDCD6CC49');
        $this->addSql('ALTER TABLE `system` DROP FOREIGN KEY FK_C94D118BDD842E46');
        $this->addSql('ALTER TABLE `system` ADD CONSTRAINT FK_C94D118BDCD6CC49 FOREIGN KEY (branch_id) REFERENCES branch (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE `system` ADD CONSTRAINT FK_C94D118BDD842E46 FOREIGN KEY (position_id) REFERENCES position (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
