<?php

namespace App\Services;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistItem;
use Illuminate\Support\Collection;

class ChecklistTemplateService
{
  /**
   * Category display names
   */
  private const CATEGORY_NAMES = [
    'printer' => 'Printer',
    'switch' => 'Switch',
    'vvip' => 'VVIP',
    'pc_desktop' => 'PC/Desktop',
    'access_point' => 'Access Point'
  ];

  /**
   * Get all checklist templates
   */
  public function getAllTemplates(): Collection
  {
    return ChecklistTemplate::with('items')->get();
  }

  /**
   * Get templates by category
   */
  public function getTemplatesByCategory(string $category, bool $activeOnly = false): Collection
  {
    $query = ChecklistTemplate::with('items')
      ->where('category', $category);

    if ($activeOnly) {
      $query->where('is_active', true);
    }

    return $query->get();
  }

  /**
   * Get single template by ID
   */
  public function getTemplate(int $id): ?ChecklistTemplate
  {
    return ChecklistTemplate::with('items')->find($id);
  }

  /**
   * Create new checklist template
   */
  public function createTemplate(array $data): ChecklistTemplate
  {
    // Generate name from category if not provided
    $templateName = $data['name'] ?? $this->getCategoryName($data['category']);

    $template = ChecklistTemplate::create([
      'category' => $data['category'],
      'name' => $templateName,
      'device_fields' => $data['device_fields'],
      'configuration_items' => $data['configuration_items'],
      'special_fields' => $data['special_fields'] ?? [],
      'is_active' => $data['is_active'] ?? false,
    ]);

    // Create checklist items
    if (isset($data['items'])) {
      $this->createChecklistItems($template->id, $data['items']);
    }

    return $template->load('items');
  }

  /**
   * Update checklist template
   */
  public function updateTemplate(int $id, array $data): ?ChecklistTemplate
  {
    $template = ChecklistTemplate::find($id);

    if (!$template) {
      return null;
    }

    // Generate name from category if category is being updated and name is not provided
    $updateData = [];
    if (isset($data['category']) && !isset($data['name'])) {
      $updateData['name'] = $this->getCategoryName($data['category']);
    }

    $baseUpdateFields = [
      'device_fields',
      'configuration_items',
      'special_fields',
      'is_active'
    ];

    if (isset($data['category'])) {
      $baseUpdateFields[] = 'category';
    }

    $dataToUpdate = array_intersect_key($data, array_flip($baseUpdateFields));
    $dataToUpdate = array_merge($updateData, $dataToUpdate);
    $template->update($dataToUpdate);

    // Update items if provided
    if (isset($data['items'])) {
      // Delete existing items
      ChecklistItem::where('checklist_template_id', $template->id)->delete();

      // Create new items
      $this->createChecklistItems($template->id, $data['items']);
    }

    return $template->load('items');
  }

  /**
   * Delete checklist template
   */
  public function deleteTemplate(int $id): bool
  {
    $template = ChecklistTemplate::find($id);

    if (!$template) {
      return false;
    }

    $template->delete();
    return true;
  }

  /**
   * Duplicate checklist template
   */
  public function duplicateTemplate(int $id): ?ChecklistTemplate
  {
    $template = ChecklistTemplate::with('items')->find($id);

    if (!$template) {
      return null;
    }

    $baseName = $template->name;
    $baseDeviceName = $template->device_fields['device'] ?? '';

    // Remove existing (Copy) suffixes
    $baseName = preg_replace('/ \(Copy[0-9]*\)$/', '', $baseName);
    $baseDeviceName = preg_replace('/ \(Copy[0-9]*\)$/', '', $baseDeviceName);

    // Find unique name
    $newSuffix = ' (Copy)';
    $newName = $baseName . $newSuffix;
    $counter = 1;

    while (ChecklistTemplate::where('name', $newName)->exists()) {
      $newSuffix = " (Copy{$counter})";
      $newName = $baseName . $newSuffix;
      $counter++;
    }

    $newDeviceFields = $template->device_fields;
    $newDeviceFields['device'] = $baseDeviceName . $newSuffix;

    $newTemplate = ChecklistTemplate::create([
      'category' => $template->category,
      'name' => $newName,
      'device_fields' => $newDeviceFields,
      'configuration_items' => $template->configuration_items,
      'special_fields' => $template->special_fields,
      'is_active' => false,
    ]);

    // Copy checklist items
    foreach ($template->items as $item) {
      ChecklistItem::create([
        'checklist_template_id' => $newTemplate->id,
        'title' => $item->title,
        'columns' => $item->columns,
        'items' => $item->items,
        'order' => $item->order,
      ]);
    }

    return $newTemplate->load('items');
  }

  /**
   * Get category display name
   */
  public function getCategoryName(string $category): string
  {
    return self::CATEGORY_NAMES[$category] ?? ucfirst($category);
  }

  /**
   * Create checklist items for a template
   */
  private function createChecklistItems(int $templateId, array $items): void
  {
    foreach ($items as $item) {
      ChecklistItem::create([
        'checklist_template_id' => $templateId,
        'title' => $item['title'],
        'columns' => $item['columns'],
        'items' => $item['items'],
        'order' => $item['order'],
      ]);
    }
  }
}
