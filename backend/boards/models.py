from adminsortable.fields import SortableForeignKey
from adminsortable.models import SortableMixin
from django.contrib.auth import get_user_model
from django.db import models
from model_utils.models import TimeStampedModel

User = get_user_model()


class Board(models.Model):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="owned_boards"
    )
    members = models.ManyToManyField(User, related_name="boards")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        is_new = self.pk is None
        super().save(force_insert, force_update, using, update_fields)
        if is_new:
            self.members.add(self.owner)


class Column(SortableMixin):
    title = models.CharField(max_length=255)
    board = models.ForeignKey("Board", related_name="columns", on_delete=models.CASCADE)
    column_order = models.PositiveIntegerField(default=0, editable=False, db_index=True)

    class Meta:
        ordering = ["column_order"]

    def __str__(self):
        return f"{self.title}"


class Label(models.Model):
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=7)
    board = models.ForeignKey("Board", related_name="labels", on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["name", "board"], name="unique_name_board")
        ]


class Priority(models.TextChoices):
    HIGH = "H", "High"
    MEDIUM = "M", "Medium"
    LOW = "L", "Low"

class Project(SortableMixin, TimeStampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    board = models.ForeignKey("Board", related_name="projects", on_delete=models.CASCADE)
    priority = models.CharField(
        max_length=1, choices=Priority.choices, default=Priority.MEDIUM
    )
    labels = models.ManyToManyField(Label, related_name="projects")
    project_order = models.PositiveIntegerField(default=0, editable=False, db_index=True)
    due_date = models.DateField(null=True)
    closed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id} - {self.title}"

    class Meta:
        ordering = ["project_order"]

class Task(SortableMixin, TimeStampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.CharField(
        max_length=1, choices=Priority.choices, default=Priority.MEDIUM
    )
    labels = models.ManyToManyField(Label, related_name="tasks")
    assignees = models.ManyToManyField(User, related_name="tasks")
    column = SortableForeignKey(Column, related_name="tasks", on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name="tasks", null=True, on_delete=models.CASCADE)
    task_order = models.PositiveIntegerField(default=0, editable=False, db_index=True)
    due_date = models.DateField(null=True)
    parent_task = models.ForeignKey('self', related_name="child_tasks", null=True, on_delete=models.SET_NULL)
    closed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.id} - {self.title}"

    class Meta:
        ordering = ["task_order"]
