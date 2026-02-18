# Copilot / AI Agent Instructions — hello_world

Be concise and follow the module's existing patterns. This file contains the minimal, project-specific knowledge an AI coding agent needs to be productive in this Odoo 19 addon.

## Project Overview
- **Project type**: Odoo addon module (single module named `hello_world`).
- **Root structure**: `__manifest__.py`, `__init__.py`, `models/`, `views/`.

## Key Files & Components

### Manifest (`__manifest__.py`)
- Module metadata and dependencies.
- Depends on `base` only.
- Data files: `views/hello_view.xml` (loaded on module install/update).
- Settings: `installable: True`, `application: True`.

### Model Definition (`models/hello_model.py`)
- Class name: `HelloWorld`
- Technical name (`_name`): `hello.world`
- Fields: `name` (Char, required)
- Import chain: `models/__init__.py` → `from . import hello_model`

### Views & UI (`views/hello_view.xml`)
Key XML record ids (exact references for edits):
- **List view**: `view_hello_world_list` (tree, model="hello.world")
- **Form view**: `view_hello_world_form` (form, model="hello.world")
- **Action**: `action_hello_world` (res_model="hello.world", view_mode="tree,form")
- **Main menu**: `menu_hello_world_root` (top-level app menu)
- **Sub-menu**: `menu_hello_world_items` (links to action)

## Architecture & Big Picture
This is a small, self-contained Odoo addon:
1. **Model layer**: `hello.world` model with a single `name` field.
2. **UI layer**: Tree (list) and form views, action, and menu items declared in XML.
3. **Data wiring**: Views, actions, and menus are registered via `ir.ui.view`, `ir.actions.act_window`, and `menuitem` XML records.

The manifest's `data` list ensures XML records are loaded on module install/update. Keep consistency:
- Model `_name` must match XML view `model` attribute and action `res_model`.
- Record ids follow the `view_hello_world_*`, `action_hello_world` naming convention.

## Developer Workflows

### Installing/Updating the Module
```bash
# Standard Odoo update (adjust -c for your config, -d for your database):
odoo -c /path/to/odoo.conf -d your_database -u hello_world
```

### Quick Python Inspection
```bash
# Access Odoo shell to inspect models:
odoo shell -d your_database
# Then in the shell:
env['hello.world'].search([])  # List all records
```

### Adding a New Model File
1. Create `models/my_new_model.py` with class and `_name`.
2. Update `models/__init__.py`: add `from . import my_new_model`.
3. Restart Odoo or update module to register the new model.

## Critical Conventions (Do NOT Change Without Updating Related Files)

- **Model name consistency**: Keep `_name` in Python model in sync with `model` attributes in XML views and action `res_model`.
- **Record id naming**: Use `hello_world` prefix style: `view_hello_world_*`, `action_hello_world`, `menu_hello_world_*`.
- **Model imports**: Always register new model modules in `models/__init__.py` with `from . import <filename>`.
- **XML-Python binding**: Never change a model's `_name` or view model without updating all cross-references.

## Copyable Code Examples

### Manifest dependency & data registration:
```python
"depends": ["base"],
"data": ["views/hello_view.xml"],
```

### Model class (in `models/hello_model.py`):
```python
from odoo import models, fields

class HelloWorld(models.Model):
    _name = "hello.world"
    _description = "Hello World Model"
    name = fields.Char(string="Nom", required=True)
```

### View record (in `views/hello_view.xml`):
```xml
<record id="view_hello_world_form" model="ir.ui.view">
    <field name="name">hello.world.form</field>
    <field name="model">hello.world</field>
    <field name="arch" type="xml">
        <form string="Hello World">
            <sheet>
                <group>
                    <field name="name"/>
                </group>
            </sheet>
        </form>
    </field>
</record>
```

## Rules for AI Agents & PR Contributions

1. **Keep changes minimal and focused**: One logical change per commit/PR.
2. **Consistency check**: Verify manifest, model `_name`, and all XML `model`/`res_model` attributes are in sync.
3. **Naming convention**: Follow existing id/class naming (`hello_world` prefix for records and views).
4. **Model imports**: When adding models, update `models/__init__.py`.
5. **Test & verify**: Install/update module and manually check that new menus, views, or fields appear correctly in the UI.

## External Dependencies
- **Python packages**: None (uses standard Odoo core).
- **Odoo dependencies**: Only `base` (the foundation module).
- **Integration**: Standard Odoo registries (`ir.model`, `ir.ui.view`, `ir.actions.act_window`, `menuitem`).

---
**Last updated**: 2025-11-12  
If you find inaccuracies or need to add environment-specific commands, please update this file.