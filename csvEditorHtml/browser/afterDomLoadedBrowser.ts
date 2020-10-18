/* stuff to do after dom is fully loaded but before scripts */
executeAfterDomLoadedQueue.forEach(p => p())