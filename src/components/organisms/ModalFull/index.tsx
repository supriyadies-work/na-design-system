import React, { useEffect } from "react";
import { Modal } from "@na-design-system/components/molecules/Modal";
import { Button } from "@na-design-system/components/atoms/Button";
import { Text } from "@na-design-system/components/atoms/Text";
import { cn } from "@na-design-system/utils/cn";

interface ModalFullProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showCloseButton?: boolean;
}

export const ModalFull: React.FC<ModalFullProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
  showCloseButton = true,
}) => {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      footer={
        footer ||
        (showCloseButton && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        ))
      }
    >
      {children}
    </Modal>
  );
};

export default ModalFull;
