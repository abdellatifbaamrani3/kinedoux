import asyncio
import logging
from collections.abc import Coroutine
from typing import Any

log = logging.getLogger("kenidoux.tasks")

# asyncio only keeps weak references to tasks; hold strong ones so they are never garbage-collected mid-flight.
_background: set[asyncio.Task] = set()


def spawn(coro: Coroutine[Any, Any, Any], name: str | None = None) -> asyncio.Task:
    task = asyncio.create_task(coro, name=name)
    _background.add(task)

    def _done(t: asyncio.Task) -> None:
        _background.discard(t)
        if not t.cancelled() and t.exception():
            log.error("background task %s crashed", t.get_name(), exc_info=t.exception())

    task.add_done_callback(_done)
    return task
