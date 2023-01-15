/* Added for Intertwined Firebase integration in order to add and change groups. */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { IconCheck, IconX } from '@tabler/icons';
import { ButtonBar } from '../container/button-bar';
import { CardContent } from '../container/card';
import { CardButton, CardButtonProps } from './card-button';
import { IconButton, IconButtonProps } from './icon-button';
import { TextInput } from './text-input';

export interface DualPromptValidationResponse {
    message?: string;
    valid: boolean;
}

export type DualPromptButtonValidator = (
    value: string
) => DualPromptValidationResponse | Promise<DualPromptValidationResponse>;

export interface DualPromptButtonProps
    extends Omit<CardButtonProps, 'ariaLabel' | 'onChangeOpen' | 'open'> {
    cancelIcon?: React.ReactNode;
    cancelLabel?: string;
    firstOnChange: React.ChangeEventHandler<HTMLInputElement>;
    secondOnChange: React.ChangeEventHandler<HTMLInputElement>;
    onSubmit: (value: string, secondValue: string) => void;
    firstPrompt: string;
    secondPrompt: string;
    submitIcon?: React.ReactNode;
    submitLabel?: string;
    submitVariant?: IconButtonProps['variant'];
    firstValidate?: DualPromptButtonValidator;
    secondValidate?: DualPromptButtonValidator;
    firstValue: string;
    secondValue: string;
}

export const DualPromptButton: React.FC<DualPromptButtonProps> = props => {
    const {
        cancelIcon,
        cancelLabel,
        firstOnChange,
        secondOnChange,
        onSubmit,
        firstPrompt,
        secondPrompt,
        submitIcon,
        submitLabel,
        submitVariant,
        firstValidate,
        secondValidate,
        firstValue,
        secondValue,
        ...other
    } = props;
    const mounted = React.useRef(true);
    const [open, setOpen] = React.useState(false);
    const [firstValidation, setFirstValidation] =
        React.useState<DualPromptValidationResponse>();
    const [secondValidation, setSecondValidation] =
        React.useState<DualPromptValidationResponse>();
    const { t } = useTranslation();

    React.useEffect(() => {
        async function updateValidation() {
            if (firstValidate) {
                const validation = await firstValidate(firstValue);

                if (mounted.current) {
                    setFirstValidation(validation);
                }
            } else {
                if (mounted.current) {
                    setFirstValidation({ valid: true });
                }
            }
        }
        setFirstValidation({valid: false})
        updateValidation();
    }, [firstValidate, firstValue]);

    React.useEffect(() => {
        async function updateSecondValidation() {
            if (secondValidate) {
                const validation = await secondValidate(secondValue);

                if (mounted.current) {
                    setSecondValidation(validation);
                }
            } else {
                if (mounted.current) {
                    setSecondValidation({ valid: true });
                }
            }
        }
        setSecondValidation({valid: false})
        updateSecondValidation();
    }, [secondValidate, secondValue]);

    React.useEffect(() => {
        return () => {
            mounted.current = false;
        };
    }, []);

    function handleCancel(event: React.MouseEvent) {
        event.preventDefault();
        setOpen(false);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        // It's possible to submit with the Enter key and bypass us disabling the
        // submit button, so we need to catch that here.

        if (firstValidation?.valid && secondValidation?.valid) {
            onSubmit(firstValue, secondValue);
            setOpen(false);
        }
    }

    return (
        <span className="prompt-button">
            <CardButton
                ariaLabel={firstPrompt}
                onChangeOpen={setOpen}
                open={open}
                {...other}
            >
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <TextInput onChange={firstOnChange} orientation="vertical" value={firstValue}>
                            {firstPrompt}
                        </TextInput>
                        {firstValidation?.message && <p>{firstValidation.message}</p>}
                    </CardContent>
                    <CardContent>
                        <TextInput onChange={secondOnChange} orientation="vertical" value={secondValue}>
                            {secondPrompt}
                        </TextInput>
                        {secondValidation?.message && <p>{secondValidation.message}</p>}
                    </CardContent>
                    <ButtonBar>
                        <IconButton
                            buttonType="submit"
                            disabled={(!firstValidation?.valid) || (!secondValidation?.valid)}
                            icon={submitIcon ?? <IconCheck />}
                            label={submitLabel ?? t('common.ok')}
                            variant={submitVariant ?? 'primary'}
                        />
                        <IconButton
                            buttonType="button"
                            icon={cancelIcon ?? <IconX />}
                            label={cancelLabel ?? t('common.cancel')}
                            onClick={handleCancel}
                        />
                    </ButtonBar>
                </form>
            </CardButton>
        </span>
    );
};
