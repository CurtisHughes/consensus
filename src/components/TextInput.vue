<template>
  <input type="text" @input="$emit('input', $event.target.value)" />
</template>

<style scoped lang="scss">
input {
    border: 1px solid #ced4da;
    border-radius: .25rem;
    color: var(--primary-font-color, #2c3e50);
    font-size: 16px;
    font-family: inherit;
    line-height: 1.5;
    padding: .375rem .75rem;
    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    outline: none;
    appearance: none;

    &::placeholder {
        color: var(--secondary-font-color, #2c3e508a);
    }

    &:focus {
        border-color: var(--app-color, #CB89FF);
    }
}
</style>
